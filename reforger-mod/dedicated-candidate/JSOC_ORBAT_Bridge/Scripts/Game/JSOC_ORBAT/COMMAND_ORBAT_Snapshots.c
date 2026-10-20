// Original COMMAND profile snapshots. No arbitrary file paths or scripts are accepted.
class COMMAND_ORBAT_SnapshotTarget
{
    string targetRequestId;
    string unitId;
};
class COMMAND_ORBAT_SnapshotPose
{
    string resourceName;
    float worldX;
    float worldY;
    float worldZ;
    float headingDegrees;
};
class COMMAND_ORBAT_SnapshotEntity : COMMAND_ORBAT_SnapshotPose
{
    string unitId;
    string factionKey;
    bool group;
    ref array<ref COMMAND_ORBAT_SnapshotPose> members = {};
    ref array<ref JSOC_ORBAT_GMRequest> orders = {};
};
class COMMAND_ORBAT_Snapshot
{
    int version;
    string snapshotName;
    string mode;
    string world;
    string sourceMissionSha256;
    ref array<string> requiredAddons = {};
    ref array<ref COMMAND_ORBAT_SnapshotEntity> entities = {};
};
class COMMAND_ORBAT_SnapshotOrders
{
    ref map<string, ref JSOC_ORBAT_GMRequest> Values = new map<string, ref JSOC_ORBAT_GMRequest>();
};
class COMMAND_ORBAT_SnapshotReceiptEntity : COMMAND_ORBAT_SnapshotPose
{
    string unitId;
    string factionKey;
    int memberCount;
    int orderCount;
    string ordersText;
};
class COMMAND_ORBAT_SnapshotReceipt
{
    string snapshotName;
    string mode;
    int entityCount;
    string world;
    ref array<string> requiredAddons = {};
    ref array<ref COMMAND_ORBAT_SnapshotReceiptEntity> entities = {};
};
class COMMAND_ORBAT_SnapshotResult
{
    string requestId;
    string status = "executed";
    string message;
    ref array<string> createdIds = {};
    ref COMMAND_ORBAT_SnapshotReceipt snapshot;
};
