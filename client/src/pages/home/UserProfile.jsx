import { CalendarDays, Ticket } from "lucide-react";
import ProfileEditor from "../../components/home/ProfileEditor";
import Sidebar from "../../components/layout/profile/UserProfile";

function EmptySection({ title, message, icon: Icon }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#171e2b] p-5">
      <div className="flex items-center gap-2">
        <Icon className="text-[#00ff85]" size={20} />

        <h2 className="text-lg font-semibold">
          {title}
        </h2>
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-white/10 p-8 text-center">
        <p className="text-sm text-slate-400">
          {message}
        </p>
      </div>
    </section>
  );
}

export default function UserProfile() {
  const stats = [
    {
      label: "Tickets Booked",
      value: 0,
      icon: Ticket,
    },
    {
      label: "Events Attended",
      value: 0,
      icon: CalendarDays,
    },
  ];

  return (
    <ProfileEditor stats={stats} Sidebar={Sidebar}>
      <div className="grid gap-5 xl:grid-cols-2">
        <EmptySection
          title="Booked Tickets"
          message="In here you can see teh Booked Tickets now you have not have any boooked ticket"
          icon={Ticket}
        />

        <EmptySection
          title="Participated Events"
          message="Your attended events will show in here."
          icon={CalendarDays}
        />
      </div>
    </ProfileEditor>
  );
}
