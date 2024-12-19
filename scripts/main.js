import * as BossBar from "./bossbar.js";

Hooks.on("getSceneControlButtons", (controls) => {
  const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");
  let show = false;
  if (hasBossBar) {
    show = hasBossBar.show;
  }

  if (!game.user.isGM) return;
  const tokenControls = controls.find((control) => control.name === "token");
  if (tokenControls) {
    tokenControls.tools.push({
      name: "herald-bossbar",
      title: "Herald Bossbar",
      icon: "fas fa-meh",
      visible: true,
      toggle: true,
      active: show,
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
    name: "Hit Point Texture",
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

  game.settings.register("herald-bossbar-beta", "bgHpColor", {
    name: "Hit point Color Texture",
    hint: "Set the color for background hp (e.g., '#ffb8b3').",
    scope: "world",
    config: true,
    type: String,
    category: "Health Bar",
    default: "#ffb8b3",
    onChange: (value) => {
      document.querySelectorAll(".bghp-bar").forEach((element) => {
        element.style.backgroundColor = value;
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

  game.settings.register("herald-bossbar-beta", "bgTempHpColor", {
    name: "Temporary HP Color Texture",
    hint: "Set the color for background temporary hp (e.g., '#b3e3ff').",
    scope: "world",
    config: true,
    type: String,
    category: "Health Bar",
    default: "#b3e3ff",
    onChange: (value) => {
      document.querySelectorAll(".bgtemphp-bar").forEach((element) => {
        element.style.backgroundColor = value;
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

  game.settings.register("herald-bossbar-beta", "hpBarShape", {
    name: "Hp Bar Shape",
    hint: "Choose the skew angle for the HP background.",
    scope: "world",
    config: true,
    type: String,
    category: "Health Bar",
    choices: {
      "0deg": "Rectangle",
      "-40deg": "Parallelogram",
    },
    default: "-40deg",
    onChange: (value) => {
      document.querySelectorAll(".hpbg").forEach((bar) => {
        bar.style.transform = `skewX(${value})`;
      });
      document.querySelectorAll(".wbhpbg").forEach((bar) => {
        bar.style.transform = `skewX(${value})`;
      });
      document.querySelectorAll(".wbtemphpbg").forEach((bar) => {
        bar.style.transform = `skewX(${value})`;
      });
    },
  });

  game.settings.register("herald-bossbar-beta", "showHpPercent", {
    name: "Show Percentage",
    hint: "Toggle the display of Show Hp Percentage",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    category: "Health Bar",
    onChange: (value) => {
      BossBar.displayOrnamentBar("hpPercent", value);
    },
  });

  //=== Effect & Mystic ===

  game.settings.register("herald-bossbar-beta", "showEffects", {
    name: "Display Effect",
    hint: "Toggle the display of Effects",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    category: "Effect & Mystic",
    onChange: (value) => {
      BossBar.displayOrnamentBar("effects", value);
    },
  });
  game.settings.register("herald-bossbar-beta", "showLegact", {
    name: "Display Legendary Action",
    hint: "Toggle the display of Legendary Action",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    category: "Effect & Mystic",
    onChange: (value) => {
      BossBar.displayOrnamentBar("legact", value);
    },
  });

  game.settings.register("herald-bossbar-beta", "showLegres", {
    name: "Display Legendary Resistance",
    hint: "Toggle the display of Legendary Resistance",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    category: "Effect & Mystic",
    onChange: (value) => {
      BossBar.displayOrnamentBar("legres", value);
    },
  });

  game.settings.register("herald-bossbar-beta", "legactOnImg", {
    name: "Legendary Action - Activate",
    hint: "Set the Legendary Action - Activate",
    scope: "world",
    config: true,
    type: String,
    default: "/modules/herald-bossbar-beta/assets/legact_on.webp",
    filePicker: true,
    category: "Effect & Mystic",
    onChange: (value) => {
      BossBar.changeImageOrnament("legactOn", value);
    },
  });

  game.settings.register("herald-bossbar-beta", "legactOffImg", {
    name: "Legendary Action - Inactivate",
    hint: "Set the Legendary Action - Inactivate",
    scope: "world",
    config: true,
    type: String,
    default: "/modules/herald-bossbar-beta/assets/legact_off.webp",
    filePicker: true,
    category: "Effect & Mystic",
    onChange: (value) => {
      BossBar.changeImageOrnament("legactOff", value);
    },
  });

  game.settings.register("herald-bossbar-beta", "legresOnImg", {
    name: "Legendary Resistance - Activate",
    hint: "Set the Legendary Resistance - Activate",
    scope: "world",
    config: true,
    type: String,
    default: "/modules/herald-bossbar-beta/assets/legres_on.webp",
    filePicker: true,
    category: "Effect & Mystic",
    onChange: (value) => {
      BossBar.changeImageOrnament("legresOn", value);
    },
  });

  game.settings.register("herald-bossbar-beta", "legresOffImg", {
    name: "Legendary Resistance - Inactivate",
    hint: "Set the Legendary Resistance - Inactivate",
    scope: "world",
    config: true,
    type: String,
    default: "/modules/herald-bossbar-beta/assets/legres_off.webp",
    filePicker: true,
    category: "Effect & Mystic",
    onChange: (value) => {
      BossBar.changeImageOrnament("legresOff", value);
    },
  });

  game.settings.register("herald-bossbar-beta", "mysticActionImage", {
    name: "Mystic Action Image",
    hint: "Set the Mystic Action Image",
    scope: "world",
    config: true,
    type: String,
    default: "/modules/herald-bossbar-beta/assets/mystic_action.webp",
    filePicker: true,
    category: "Effect & Mystic",
    onChange: (value) => {
      BossBar.changeImageOrnament("mysticAction", value);
    },
  });
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
    },
  });
  //=== Token ===
  game.settings.register("herald-bossbar-beta", "tokenGlowColor", {
    name: "Glow Icon Hex Code",
    hint: "Set the glow color for the token image's (e.g., '#ff7f00').",
    scope: "world",
    config: true,
    type: String,
    category: "Token",
    default: "#ff7f00",
    onChange: (value) => {
      document.querySelectorAll(".image-token").forEach((element) => {
        element.style.boxShadow = `0 0 10px 5px ${value}`;
      });
    },
  });

  game.settings.register("herald-bossbar-beta", "rotationOrnamen", {
    name: "Rotation Speed for Background Ornament (ms)",
    hint: "Set the in milliseconds for rotation speed",
    scope: "world",
    config: true,
    type: Number,
    category: "Token",
    default: 5000,
    onChange: (value) => {
      document.querySelectorAll(".bg-ornamen").forEach((element) => {
        element.style.animation = `rotateOrnament ${value}ms linear infinite`;
      });
    },
  });

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
