from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile_picture', 'role', 'last_login', 'date_joined')
        read_only_fields = ('id', 'role')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password', 'password_confirm')

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        user = User(username=attrs['username'], email=attrs['email'])
        validate_password(attrs['password'], user)
        return attrs

    def validate_username(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError('Username must be at least 3 characters long.')
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('That username is already in use. Please choose another.')
        return value

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists. Try signing in instead.')
        return value

    def create(self, validated_data):
        validated_data['is_active'] = False
        return User.objects.create_user(**validated_data)

# this is for validation
class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = (attrs.get('username') or '').strip()
        password = attrs.get('password') or ''
        if not username:
            raise serializers.ValidationError({'detail': 'Please enter your username.'})
        if not password:
            raise serializers.ValidationError({'detail': 'Please enter your password.'})
        user = authenticate(self.context.get('request'), username=username, password=password)
        if user is None:
            raise serializers.ValidationError({'detail': 'The username or password is incorrect.'})
        if not user.is_active:
            raise serializers.ValidationError({'detail': 'Please verify your email before signing in.'})
        self.user = user
        refresh = self.get_token(user)
        return {'refresh': str(refresh), 'access': str(refresh.access_token), 'user': user}

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token


class AdminLoginSerializer(LoginSerializer):
    def validate(self, attrs):
        values = super().validate(attrs)
        if values['user'].role != User.Role.ADMIN and not values['user'].is_staff:
            raise serializers.ValidationError({'detail': 'This account does not have administrator access.'})
        return values


class RoleUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('role',)


class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.RegexField(r'^\d{6}$', error_messages={'invalid': 'Enter the six-digit verification code.'})


class ResendVerificationCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
