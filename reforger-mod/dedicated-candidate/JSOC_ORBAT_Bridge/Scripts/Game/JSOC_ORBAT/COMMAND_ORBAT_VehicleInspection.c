// Read-only snapshot of the vehicle's native compartment manager, never an embark action.
class COMMAND_ORBAT_VehicleInspection
{
    int capacity; int occupied; int available; int reserved; int locked; int inaccessible;
    int players; int ai; int other; int driverAvailable; int gunnerAvailable; int cargoAvailable;
    static COMMAND_ORBAT_VehicleInspection Read(IEntity target)
    {
        if (!target) return null;
        BaseCompartmentManagerComponent manager = BaseCompartmentManagerComponent.Cast(target.FindComponent(BaseCompartmentManagerComponent));
        if (!manager) return null;
        array<BaseCompartmentSlot> seats = {}; manager.GetCompartments(seats);
        if (seats.Count() < 1 || seats.Count() > 128) return null;
        COMMAND_ORBAT_VehicleInspection result = new COMMAND_ORBAT_VehicleInspection();
        result.capacity = seats.Count(); PlayerManager people = GetGame().GetPlayerManager();
        foreach (BaseCompartmentSlot seat : seats)
        {
            if (!seat) return null;
            if (seat.IsReserved()) result.reserved++;
            if (seat.IsGetInLocked()) result.locked++;
            if (!seat.IsCompartmentAccessible()) result.inaccessible++;
            IEntity occupant = seat.GetOccupant();
            if (seat.IsOccupied() || occupant)
            {
                result.occupied++;
                if (occupant && people && people.GetPlayerIdFromControlledEntity(occupant) > 0) result.players++;
                else
                {
                    AIControlComponent control;
                    if (occupant) control = AIControlComponent.Cast(occupant.FindComponent(AIControlComponent));
                    if (control && control.GetAIAgent()) result.ai++; else result.other++;
                }
            }
            else if (!seat.IsReserved() && !seat.IsGetInLocked() && seat.IsCompartmentAccessible())
            {
                if (seat.GetType() == ECompartmentType.PILOT) result.driverAvailable++;
                else if (seat.GetType() == ECompartmentType.TURRET) result.gunnerAvailable++;
                else if (seat.GetType() == ECompartmentType.CARGO) result.cargoAvailable++;
                else return null;
                result.available++;
            }
        }
        return result;
    }
    string ToJson()
    {
        return string.Format("{\"capacity\":%1,\"occupied\":%2,\"available\":%3,\"reserved\":%4,\"locked\":%5,\"inaccessible\":%6,",capacity,occupied,available,reserved,locked,inaccessible)
            + string.Format("\"players\":%1,\"ai\":%2,\"other\":%3,\"driverAvailable\":%4,\"gunnerAvailable\":%5,\"cargoAvailable\":%6}",players,ai,other,driverAvailable,gunnerAvailable,cargoAvailable);
    }
};
