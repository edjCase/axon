import v_2_0_1 "./v002_000_001";
import v_2_0_2 "./v002_001_001";
import MigrationTypes "./types";
import D "mo:base/Debug";

module {
  let upgrades = [
    
    // do not forget to add your new migration upgrade method here
    v_2_0_1.upgrade,
    v_2_0_2.upgrade
  ];

  let downgrades = [
    v_2_0_1.downgrade,
    v_2_0_2.downgrade,
    // do not forget to add your new migration downgrade method here
  ];

  func getMigrationId(state: MigrationTypes.State): Nat {
    return switch (state) {
      case (#v0_0_0(_)) 0;
      case (#v2_0_1(_)) 1;
      case (#v2_1_1(_)) 2;
      // do not forget to add your new migration id here
      // should be increased by 1 as it will be later used as an index to get upgrade/downgrade methods
    };
  };

  public func migrate(
    prevState: MigrationTypes.State, 
    nextState: MigrationTypes.State, 
    args: MigrationTypes.Args
  ): MigrationTypes.State {
    
    var state = prevState;
    var migrationId = getMigrationId(prevState);

    let nextMigrationId = getMigrationId(nextState);

    while (migrationId != nextMigrationId) {
      D.print("in storage while");
      let migrate = if (nextMigrationId > migrationId) upgrades[migrationId] else downgrades[migrationId - 1];
      D.print("upgrade should have run" # debug_show(nextMigrationId, migrationId));
      migrationId := if (nextMigrationId > migrationId) migrationId + 1 else migrationId - 1;
      state := migrate(state, args);
    };

    return state;
  };
};