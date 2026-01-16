import { motion } from "framer-motion";
import { VendorTeamMember } from "@/data/vendors";

interface VendorTeamProps {
  team: VendorTeamMember[];
}

const VendorTeam = ({ team }: VendorTeamProps) => {
  if (!team || team.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <h2 className="text-xl font-heading font-bold text-foreground mb-6">
        Meet the Team
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {team.map((member, index) => (
          <div key={index} className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-muted mb-3">
              <img
                src={member.photo}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-medium text-foreground text-sm">
              {member.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {member.role}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default VendorTeam;
