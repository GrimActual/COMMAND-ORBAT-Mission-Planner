// Original COMMAND preflight. Does not install waypoints or reserve/move occupants.
// Callers must resolve authority, ownership, faction and on-foot AI membership separately,
// and call this again at execution time. A positive result is not boarding completion.
class COMMAND_ORBAT_EmbarkPreflight
{
    static bool Check(IEntity target, int members, bool driverAllowed, bool gunnerAllowed, bool cargoAllowed, out string reason)
    {
        reason = "";
        if (members < 1 || members > 16)
        {
            reason = "unsupported-squad-size";
            return false;
        }
        if (!driverAllowed && !gunnerAllowed && !cargoAllowed)
        {
            reason = "no-seat-roles";
            return false;
        }
        COMMAND_ORBAT_VehicleInspection snapshot = COMMAND_ORBAT_VehicleInspection.Read(target);
        if (!snapshot)
        {
            reason = "unsupported-vehicle";
            return false;
        }
        // Mixed player/unknown occupants remain blocked until explicit handling is delivered.
        if (snapshot.players > 0 || snapshot.other > 0)
        {
            reason = "protected-occupants";
            return false;
        }
        int seats = 0;
        if (driverAllowed) seats += snapshot.driverAvailable;
        if (gunnerAllowed) seats += snapshot.gunnerAvailable;
        if (cargoAllowed) seats += snapshot.cargoAvailable;
        if (members > seats)
        {
            reason = "insufficient-allowed-seats";
            return false;
        }
        return true;
    }
};
