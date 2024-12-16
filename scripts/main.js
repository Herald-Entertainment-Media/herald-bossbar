import * as BossBar from "./bossbar.js";

Hooks.on("getSceneControlButtons", (controls) => {
  if (!game.user.isGM) return;
  const tokenControls = controls.find((control) => control.name === "token");
  if (tokenControls) {
    tokenControls.tools.push({
      name: "herald-bossbar",
      title: "Herald Bossbar",
      icon: "fas fa-meh",
      visible: true,
      onClick: () => {
        BossBar.toggleBossbar();
      },
      button: true,
    });
  }
});

Hooks.on("ready", () => {
  BossBar.checkerBossbar();
  BossBar.GlobalChecker();
  setTimeout(() => {
    BossBar.updateSettingValue();
  }, 1500);
});

Hooks.on("init", () => {
  // === Health Bar ===
  game.settings.register("herald-bossbar-beta", "hpBarImage", {
    name: "Hit point texture",
    hint: "Set the URL HP",
    scope: "world",
    config: true,
    type: String,
    default: "/modules/herald-bossbar-beta/assets/hp.webp",
    filePicker: true,
    category: "Health Bar",
    onChange: (value) => {
      document.querySelectorAll("#hp-bar").forEach((bar) => {
        bar.style.backgroundImage = `url('${value}')`;
      });
    },
  });
  game.settings.register("herald-bossbar-beta", "tempHpBarImage", {
    name: "Temporary HP texture",
    hint: "Set the URL Temp HP",
    scope: "world",
    config: true,
    type: String,
    default: "/modules/herald-bossbar-beta/assets/temporary_hp.webp",
    filePicker: true,
    category: "Health Bar",
    onChange: (value) => {
      document.querySelectorAll("#temphp-bar").forEach((bar) => {
        bar.style.backgroundImage = `url('${value}')`;
      });
    },
  });
  game.settings.register("herald-bossbar-beta", "hpBgImage", {
    name: "Background Hp texture",
    hint: "Set the URL Background",
    scope: "world",
    config: true,
    type: String,
    default: "/modules/herald-bossbar-beta/assets/background_hp.webp",
    filePicker: true,
    category: "Health Bar",
    onChange: (value) => {
      document.querySelectorAll(".hpbg").forEach((bar) => {
        bar.style.backgroundImage = `url('${value}')`;
      });
    },
  });

  //=== Effect & Mystic ===

  game.settings.register("herald-bossbar-beta", "globalTimer", {
    name: "Universal Checker Timer",
    hint: "Set the in milliseconds for checking effects",
    scope: "world",
    config: true,
    type: Number,
    category: "Effect & Mystic",
    default: 1000,
    onChange: (value) => {
      GlobalTimerInterval = value;
      // if (setTime) clearInterval(setTime);
      // if (currentActor) GlobalChecker(currentActor);
    },
  });
  //=== Token ===
  game.settings.register("herald-bossbar-beta", "bgOrnamenImage", {
    name: "Background Ornament Image",
    hint: "Set the background ornament image",
    scope: "world",
    config: true,
    type: String,
    default: "/modules/herald-bossbar-beta/assets/bg_ornamen_token.png",
    filePicker: true,
    category: "Token",
    onChange: (value) => {
      document.querySelectorAll(".bg-ornamen").forEach((element) => {
        element.style.backgroundImage = `url('${value}')`;
      });
    },
  });
  game.settings.register("herald-bossbar-beta", "iconOrnamenImage", {
    name: "Icon Ornament Image",
    hint: "Set the icon ornament image",
    scope: "world",
    config: true,
    type: String,
    default: "/modules/herald-bossbar-beta/assets/icon_ornamen_token.webp",
    filePicker: true,
    category: "Token",
    onChange: (value) => {
      document.querySelectorAll(".icon-ornamen").forEach((element) => {
        element.style.backgroundImage = `url('${value}')`;
      });
    },
  });

  //=== Other ===
  game.settings.register("herald-bossbar-beta", "leftOrnamentImage", {
    name: "Left Ornament Image",
    hint: "Set the URL for Left Ornament image.",
    scope: "world",
    config: true,
    type: String,
    default: "/modules/herald-bossbar-beta/assets/left_ornament.png",
    filePicker: true,
    category: "Other",
    onChange: (value) => {
      document.querySelectorAll(".ornament-left").forEach((ornament) => {
        ornament.style.backgroundImage = `url('${value}')`;
      });
    },
  });

  game.settings.register("herald-bossbar-beta", "rightOrnamentImage", {
    name: "Right Ornament Image",
    hint: "Set the URL for Right Ornament image.",
    scope: "world",
    config: true,
    type: String,
    default: "/modules/herald-bossbar-beta/assets/right_ornament.png",
    filePicker: true,
    category: "Other",
    onChange: (value) => {
      document.querySelectorAll(".ornament-right").forEach((ornament) => {
        ornament.style.backgroundImage = `url('${value}')`;
      });
    },
  });

  game.settings.register("herald-bossbar-beta", "tokenNameSize", {
    name: "Font Size",
    hint: "example 20",
    scope: "world",
    config: true,
    type: Number,
    default: 20,
    category: "Other",
    onChange: (value) => {
      document.querySelectorAll(".name-token").forEach((element) => {
        element.style.fontSize = value + "px";
      });
    },
  });
});
