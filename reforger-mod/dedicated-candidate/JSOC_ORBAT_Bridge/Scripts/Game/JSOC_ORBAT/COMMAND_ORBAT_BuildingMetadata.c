// Read-only metadata assessment. Door pivots are hints, not validated entry or garrison slots.
class COMMAND_ORBAT_DoorHint
{
    vector Pivot;
    vector Normal;
    float State;
    bool Open;
    bool CurrentClearance;
};
class COMMAND_ORBAT_BuildingMetadata
{
    int Visited;
    bool Truncated;
    bool NavigationVerified;
    ref array<ref COMMAND_ORBAT_DoorHint> Doors = {};
    static COMMAND_ORBAT_BuildingMetadata Read(IEntity root)
    {
        if (!root || root.FindComponent(BaseCompartmentManagerComponent)) return null;
        COMMAND_ORBAT_BuildingMetadata result = new COMMAND_ORBAT_BuildingMetadata();
        array<IEntity> pending = {root};
        for (int cursor = 0; cursor < pending.Count() && cursor < 256; cursor++)
        {
            IEntity entity = pending[cursor];
            if (!entity) continue;
            result.Visited++;
            BaseDoorComponent door = BaseDoorComponent.Cast(entity.FindComponent(BaseDoorComponent));
            if (door && result.Doors.Count() < 64)
            {
                COMMAND_ORBAT_DoorHint hint = new COMMAND_ORBAT_DoorHint();
                hint.Pivot = door.GetDoorPivotPointWS(); hint.Normal = door.GetDoorNormal(); hint.State = door.GetNormalizedDoorState(); hint.Open = door.IsOpen(); hint.CurrentClearance = door.CanCharacterPass(0.6);
                result.Doors.Insert(hint);
            }
            else if (door) result.Truncated = true;
            IEntity child = entity.GetChildren();
            while (child)
            {
                if (pending.Count() >= 256) { result.Truncated = true; break; }
                if (pending.Find(child) < 0) pending.Insert(child);
                child = child.GetSibling();
            }
        }
        return result;
    }
};
