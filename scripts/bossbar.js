let universalTimerInterfal = 1000;
let mysticActionImg = "/modules/herald-bossbar-beta/assets/mystic_action.webp";
let legactOnImg = "/modules/herald-bossbar-beta/assets/legact_on.webp";
let legactOffImg = "/modules/herald-bossbar-beta/assets/legact_off.webp";
let legresOnImg = "/modules/herald-bossbar-beta/assets/legres_on.webp";
let legresOffImg = "/modules/herald-bossbar-beta/assets/legres_off.webp";

let showHpPercent = true;
let showMA = true;
let showEffects = true;
let showLegact = true;
let showLegres = true;

let tempHpMax = 0;

let interfalChecker = null;

function checkerBossbar() {
  setInterval(async () => {
    const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");
    if (hasBossBar) {
      await createBossbar();
    }
  }, 1000);
}

async function createBossbar() {
  const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");
  if (!hasBossBar) return;
  const currentActor = await fromUuid(hasBossBar.actorUuid);
  if (hasBossBar.show == true) {
    checkWeaknessBroken(currentActor);
  } else {
    const existingBar = document.getElementById("boss-hp-bar");
    if (existingBar) {
      existingBar.remove();
    }
  }
}

function toggleBossbar() {
  if (!game.user.isGM) return;
  const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");
  if (hasBossBar) {
    if (hasBossBar.show == false) {
      onBossbar();
    } else {
      offBossbar();
    }
  } else {
    onBossbar();
  }
}

async function onBossbar() {
  const controlledTokens = canvas.tokens.controlled;
  if (controlledTokens.length === 0) {
    ui.notifications.warn("No token is selected");
    return;
  }

  const existingBar = document.getElementById("boss-hp-bar");
  if (existingBar) {
    existingBar.remove();
  }

  const token = controlledTokens[0];
  const actor = token.actor;
  if (!actor) return;
  checkWeaknessBroken(actor);
  await canvas.scene.setFlag("world", "hasBossBar", {
    show: true,
    actorUuid: actor.uuid,
  });
  const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");
}

async function offBossbar() {
  const existingBar = document.getElementById("boss-hp-bar");
  if (existingBar) {
    existingBar.remove();
  }
  await canvas.scene.setFlag("world", "hasBossBar", {
    show: false,
    actorUuid: null,
    type: null,
  });

  const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");
}

async function checkWeaknessBroken(actor) {
  let isWeaknessBroken = false;

  for (const item of actor.items) {
    const itemEffects =
      item.effects?.filter((effect) => !effect.disabled) || [];
    for (const effect of itemEffects) {
      if (effect.label.includes("Weakness Broken Macro")) {
        tempHpMax = actor.getFlag("midi-qol", "FlowerofCreationmax");
        isWeaknessBroken = true;
      }
    }
    if (isWeaknessBroken) {
      break;
    }
  }

  if (isWeaknessBroken) {
    canvas.scene.setFlag("world", "hasBossBar", {
      type: "weaknessBroken",
    });
    createHpBarWeaknessBroken(actor);
  } else {
    canvas.scene.setFlag("world", "hasBossBar", {
      type: "normal",
    });
    createHpBar(actor);
  }
}

function createHpBarWeaknessBroken(actor) {
  const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");
  const existingBar = document.getElementById("boss-hp-bar");

  if (hasBossBar) {
    if (hasBossBar.show == true && existingBar != null) {
      return;
    }
  }

  const hp = actor.system.attributes.hp.value;
  const maxHp = actor.system.attributes.hp.max;
  const tempHp = actor.system.attributes.hp.temp || 0;
  const hpPercent = (hp / maxHp) * 100;
  const tempHpPercent = (tempHp / tempHpMax) * 100;

  fetch("/modules/herald-bossbar-beta/templates/wbhpbar.html")
    .then((response) => response.text())
    .then((html) => {
      const div = document.createElement("div");
      div.innerHTML = html;

      const tokenImage = div.querySelector("#image-token");
      const hpBar = div.querySelector("#wbhp-bar");
      const bghpBar = div.querySelector("#wbbghp-bar");
      const tempHpBar = div.querySelector("#wbtemphp-bar");
      const bgtempHpBar = div.querySelector("#wbbgtemphp-bar");
      const tokenName = div.querySelector("#name-token");

      tokenImage.src = actor.img;
      tokenName.textContent = actor.name;
      tempHpBar.style.width = `${tempHpPercent}%`;
      bgtempHpBar.style.width = `${tempHpPercent}%`;
      hpBar.style.width = `${hpPercent}%`;
      bghpBar.style.width = `${hpPercent}%`;
      div.firstChild.id = "boss-hp-bar";

      document.body.appendChild(div.firstChild);
      updatePercent("weaknessBroken", actor);
      updateTempMax(actor);
      updateMysticAction(actor);
      updateEffects(actor);
      displayLegendaryAction(actor);
      displayLegendaryResistance(actor);
    })

    .catch((err) => {
      console.error("Gagal memuat template wbhpbar.html:", err);
    });
}

function createHpBar(actor) {
  const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");
  const existingBar = document.getElementById("boss-hp-bar");

  if (hasBossBar) {
    if (hasBossBar.show == true && existingBar != null) {
      return;
    }
  }

  const hp = actor.system.attributes.hp.value;
  const maxHp = actor.system.attributes.hp.max;
  const tempHp = actor.system.attributes.hp.temp || 0;
  const hpPercent = (hp / maxHp) * 100;
  const tempHpPercent = (tempHp / maxHp) * 100;

  fetch("/modules/herald-bossbar-beta/templates/hpbar.html")
    .then((response) => response.text())
    .then((html) => {
      const div = document.createElement("div");
      div.innerHTML = html;

      const tokenImage = div.querySelector("#image-token");
      const hpBar = div.querySelector("#hp-bar");
      const bghpBar = div.querySelector("#bghp-bar");
      const tempHpBar = div.querySelector("#temphp-bar");
      const bgtempHpBar = div.querySelector("#bgtemphp-bar");
      const tokenName = div.querySelector("#name-token");

      tokenImage.src = actor.img;
      tokenName.textContent = actor.name;
      tempHpBar.style.width = `${tempHpPercent}%`;
      bgtempHpBar.style.width = `${tempHpPercent}%`;
      hpBar.style.width = `${hpPercent}%`;
      bghpBar.style.width = `${hpPercent}%`;
      div.firstChild.id = "boss-hp-bar";

      document.body.appendChild(div.firstChild);
      updatePercent("normal", actor);
      updateMysticAction(actor);
      updateEffects(actor);
      displayLegendaryAction(actor);
      displayLegendaryResistance(actor);
    })
    .catch((err) => {
      console.error("Gagal memuat template hpbar.html:", err);
    });
}

function updatePercent(status, actor) {
  const hp = actor.system.attributes.hp.value;
  const maxHp = actor.system.attributes.hp.max;
  const hpPercent = Math.ceil((hp / maxHp) * 100);
  let divHpPercent = document.getElementById("hp-percent");
  if (status == "weaknessBroken") {
    divHpPercent = document.getElementById("wbhp-percent");
  }

  if (showHpPercent == false) {
    divHpPercent.innerText = "";
    return;
  }
  if (divHpPercent) {
    divHpPercent.innerText = hpPercent + "%";
  }
}

function updateTempMax(actor) {
  const tempHp = actor.system.attributes.hp.temp || 0;
  const tempHpPercent = (tempHp / tempHpMax) * 100;
  let divTempMax = document.getElementById("wbtemp-max");

  // if (showHpPercent == false) {
  //   divTempMax.innerText = "";
  //   return;
  // }
  if (divTempMax) {
    divTempMax.innerText = tempHp + "/" + tempHpMax;
  }
}

function updateMysticAction(actor) {
  const mysticAction = actor.items.find((item) => item.name.includes("MA"));
  let mysticDiv = document.getElementById("mystic-action");
  if (mysticDiv) {
    if (showMA == false) {
      mysticDiv.innerHTML = "";
      return;
    }
    if (mysticAction) {
      mysticDiv.innerHTML = `
      <div>
        <img id="maImg" src="${mysticActionImg}" class="maImg" alt="Mystic Action" />
      </div>
      `;
    }
  }
}

function updateEffects(actor) {
  let effectsDiv = document.getElementById("effects-container");
  let effectlist = ``;
  if (showEffects) {
    actor.effects.forEach((effect) => {
      effectlist += `
        <div>
          <img src="${effect.img}" class="token-effect" alt="${effect.name}" />
        </div>`;
    });
  }
  if (effectsDiv) {
    effectsDiv.innerHTML = effectlist;
  }
}

function displayLegendaryAction(actor) {
  const legendaryAction = actor.system.resources.legact || null;
  let legactlist = `<div class="legact-effect"></div>`;
  if (!legendaryAction) {
    return;
  }

  if (legendaryAction.max == 0) {
    legactlist = `<div class="legact-effect"></div>`;
  }

  let legactDiv = document.getElementById("legact-container");

  if (legactDiv) {
    if (showLegact == false) {
      legactDiv.innerHTML = legactlist;
      return;
    }
    if (legendaryAction.max == 0) {
      legactDiv.innerHTML = legactlist;
      return;
    }
    for (let i = 0; i < legendaryAction.max - legendaryAction.value; i++) {
      legactlist += `
        <div>
          <img src="${legactOffImg}" class="legact-effect" alt="off" />
        </div>`;
    }

    for (let i = 0; i < legendaryAction.value; i++) {
      legactlist += `
        <div>
          <img src="${legactOnImg}" class="legact-effect" alt="active" />
        </div>`;
    }

    legactDiv.innerHTML = legactlist;
  }
}

function displayLegendaryResistance(actor) {
  const legendaryResistance = actor.system.resources.legres || null;
  if (!legendaryResistance) {
    return;
  }
  let legresDiv = document.getElementById("legres-container");

  let legreslist = ``;
  if (legresDiv) {
    if (showLegres == false) {
      legresDiv.innerHTML = legreslist;
      return;
    }
    if (legendaryResistance.max == 0) {
      legresDiv.innerHTML = legreslist;
      return;
    }
    for (
      let i = 0;
      i < legendaryResistance.max - legendaryResistance.value;
      i++
    ) {
      legreslist += `
        <div>
          <img src="${legresOffImg}" class="legres-effect" alt="off" />
        </div>`;
    }

    for (let i = 0; i < legendaryResistance.value; i++) {
      legreslist += `
        <div>
          <img src="${legresOnImg}" class="legres-effect" alt="active" />
        </div>`;
    }
    legresDiv.innerHTML = legreslist;
  }
}

async function GlobalChecker() {
  clearInterval(interfalChecker);
  interfalChecker = setInterval(async () => {
    const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");

    if (hasBossBar) {
      if (hasBossBar.show == true && hasBossBar.actorUuid) {
        const currentActor = await fromUuid(hasBossBar.actorUuid);
        updateEffects(currentActor);
        updateMysticAction(currentActor);
        displayLegendaryResistance(currentActor);
        displayLegendaryAction(currentActor);
      }
    }
  }, universalTimerInterfal);
}

Hooks.on("updateActor", async (actor, data) => {
  const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");
  if (!hasBossBar) return;
  const currentActor = await fromUuid(hasBossBar.actorUuid);
  if (!currentActor) return;

  if (hasBossBar.type == "weaknessBroken") {
    const hpBar = document
      .getElementById("boss-hp-bar")
      ?.querySelector("#wbhp-bar");
    const bghpBar = document
      .getElementById("boss-hp-bar")
      ?.querySelector("#wbbghp-bar");

    const tempHpBar = document
      .getElementById("boss-hp-bar")
      ?.querySelector("#wbtemphp-bar");

    const bgtempHpBar = document
      .getElementById("boss-hp-bar")
      ?.querySelector("#wbbgtemphp-bar");
    if (hpBar) {
      const hp = currentActor.system.attributes.hp.value;
      const maxHp = currentActor.system.attributes.hp.max;
      const hpPercent = (hp / maxHp) * 100;
      hpBar.style.width = `${hpPercent}%`;
      setTimeout(() => {
        if (bghpBar) {
          bghpBar.style.width = `${hpPercent}%`;
        }
      }, 500);
    }

    if (tempHpBar) {
      const tempHp = currentActor.system.attributes.hp.temp || 0;
      const tempHpPercent = (tempHp / tempHpMax) * 100;
      tempHpBar.style.width = `${tempHpPercent}%`;
      setTimeout(() => {
        if (bgtempHpBar) {
          bgtempHpBar.style.width = `${tempHpPercent}%`;
        }
      }, 500);
    }
    updatePercent("weaknessBroken", currentActor);
    updateTempMax(currentActor);
  } else {
    const hpBar = document
      .getElementById("boss-hp-bar")
      ?.querySelector("#hp-bar");
    const bghpBar = document
      .getElementById("boss-hp-bar")
      ?.querySelector("#bghp-bar");

    const tempHpBar = document
      .getElementById("boss-hp-bar")
      ?.querySelector("#temphp-bar");

    const bgtempHpBar = document
      .getElementById("boss-hp-bar")
      ?.querySelector("#bgtemphp-bar");
    if (hpBar) {
      const hp = currentActor.system.attributes.hp.value;
      const maxHp = currentActor.system.attributes.hp.max;
      const hpPercent = (hp / maxHp) * 100;
      hpBar.style.width = `${hpPercent}%`;
      setTimeout(() => {
        if (bghpBar) {
          bghpBar.style.width = `${hpPercent}%`;
        }
      }, 500);
    }

    if (tempHpBar) {
      const tempHp = currentActor.system.attributes.hp.temp || 0;
      const maxHp = currentActor.system.attributes.hp.max;
      const tempHpPercent = (tempHp / maxHp) * 100;
      tempHpBar.style.width = `${tempHpPercent}%`;
      setTimeout(() => {
        if (bgtempHpBar) {
          bgtempHpBar.style.width = `${tempHpPercent}%`;
        }
      }, 500);
    }

    updatePercent("normal", currentActor);
  }

  updateEffects(currentActor);
  updateMysticAction(currentActor);
  displayLegendaryResistance(currentActor);
  displayLegendaryAction(currentActor);
});

async function displayOrnamentBar(name, value) {
  const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");
  if (!hasBossBar) return;
  const currentActor = await fromUuid(hasBossBar.actorUuid);
  if (!currentActor) return;
  if (name == "hpPercent") {
    showHpPercent = value;
    if (hasBossBar.type == "weaknessBroken") {
      updatePercent("weaknessBroken", currentActor);
    } else {
      updatePercent("normal", currentActor);
    }
  }
  if (name == "effects") {
    showEffects = value;
    updateEffects(currentActor);
  }
  if (name == "legact") {
    showLegact = value;
    displayLegendaryAction(currentActor);
  }
  if (name == "legres") {
    showLegres = value;
    displayLegendaryResistance(currentActor);
  }
  // if (name == "mysticAction") {
  //   showEffects = value;
  //   updateMysticAction(currentActor);
  // }
}

async function changeImageOrnament(name, value) {
  const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");
  if (!hasBossBar) return;
  const currentActor = await fromUuid(hasBossBar.actorUuid);
  if (!currentActor) return;
  if (name == "mysticAction") {
    mysticActionImg = value;
    updateMysticAction(currentActor);
  }
  if (name == "legactOn") {
    legactOnImg = value;
    displayLegendaryAction(currentActor);
  }
  if (name == "legactOff") {
    legactOffImg = value;
    displayLegendaryAction(currentActor);
  }
  if (name == "legresOn") {
    legresOnImg = value;
    displayLegendaryResistance(currentActor);
  }
  if (name == "legresOff") {
    legresOffImg = value;
    displayLegendaryResistance(currentActor);
  }
}

function changeUniversalTimer(value) {
  universalTimerInterfal = value;
  GlobalChecker();
}

// update setting value

function settingValueHealthBar() {
  const hpBarImage = game.settings.get("herald-bossbar-beta", "hpBarImage");
  let hpbar = document.getElementById("hp-bar");
  if (hpbar) {
    hpbar.style.backgroundImage = `url('${hpBarImage}')`;
  }
  const hpbarBg = game.settings.get("herald-bossbar-beta", "bgHpColor");
  let bg_hpBar = document.getElementById("bghp-bar");
  if (bg_hpBar) {
    bg_hpBar.style.backgroundColor = hpbarBg;
  }

  const tempHpBarImage = game.settings.get(
    "herald-bossbar-beta",
    "tempHpBarImage"
  );
  let temphpbar = document.getElementById("temphp-bar");
  if (temphpbar) {
    temphpbar.style.backgroundImage = `url('${tempHpBarImage}')`;
  }

  const temphpbarBg = game.settings.get("herald-bossbar-beta", "bgTempHpColor");
  let bg_temphpBar = document.getElementById("bgtemphp-bar");
  if (bg_temphpBar) {
    bg_temphpBar.style.backgroundColor = temphpbarBg;
  }

  const hpBgImage = game.settings.get("herald-bossbar-beta", "hpBgImage");
  let hpbg = document.getElementById("hpbg");

  if (hpbg) {
    hpbg.style.backgroundImage = `url('${hpBgImage}')`;
  }

  const hpBarShape = game.settings.get("herald-bossbar-beta", "hpBarShape");
  let wbhpbg = document.getElementById("wbhpbg");
  let wbtemphpbg = document.getElementById("wbtemphpbg");
  if (hpbg) {
    hpbg.style.transform = `skewX(${hpBarShape})`;
  }
  if (wbhpbg) {
    wbhpbg.style.transform = `skewX(${hpBarShape})`;
  }
  if (wbtemphpbg) {
    wbtemphpbg.style.transform = `skewX(${hpBarShape})`;
  }

  const percentValue = game.settings.get(
    "herald-bossbar-beta",
    "showHpPercent"
  );
  displayOrnamentBar("hpPercent", percentValue);
}

function settingValueEffectMystic() {
  const effectsValue = game.settings.get("herald-bossbar-beta", "showEffects");
  displayOrnamentBar("effects", effectsValue);
  const legactValue = game.settings.get("herald-bossbar-beta", "showLegact");
  displayOrnamentBar("legact", legactValue);
  const legresValue = game.settings.get("herald-bossbar-beta", "showLegres");
  displayOrnamentBar("legres", legresValue);

  // let showMA = true;
  const legactOnImg = game.settings.get("herald-bossbar-beta", "legactOnImg");
  changeImageOrnament("legactOn", legactOnImg);
  const legactOffImg = game.settings.get("herald-bossbar-beta", "legactOffImg");
  changeImageOrnament("legactOff", legactOffImg);
  const legresOnImg = game.settings.get("herald-bossbar-beta", "legresOnImg");
  changeImageOrnament("legresOn", legresOnImg);
  const legresOffImg = game.settings.get("herald-bossbar-beta", "legresOffImg");
  changeImageOrnament("legresOff", legresOffImg);
  const mysticAction = game.settings.get(
    "herald-bossbar-beta",
    "mysticActionImage"
  );
  changeImageOrnament("mysticAction", mysticAction);

  const timerInterfal = game.settings.get(
    "herald-bossbar-beta",
    "universalTimerInterfal"
  );
  universalTimerInterfal = timerInterfal;
}

function settingValueToken() {
  const tokenGlowColor = game.settings.get(
    "herald-bossbar-beta",
    "tokenGlowColor"
  );
  let tokenGlow = document.getElementById("image-token");
  if (tokenGlow) {
    tokenGlow.style.boxShadow = `0 0 10px 5px ${tokenGlowColor}`;
  }

  const bgOrnamen = game.settings.get("herald-bossbar-beta", "bgOrnamenImage");
  let bg_ornamen = document.getElementById("bg-ornamen");
  if (bg_ornamen) {
    bg_ornamen.style.backgroundImage = `url('${bgOrnamen}')`;
  }

  const rotationOrnamen = game.settings.get(
    "herald-bossbar-beta",
    "rotationOrnamen"
  );
  if (bg_ornamen) {
    bg_ornamen.style.animation = `rotateOrnament ${rotationOrnamen}ms linear infinite`;
  }

  const iconOrnamen = game.settings.get(
    "herald-bossbar-beta",
    "iconOrnamenImage"
  );
  let icon_ornamen = document.getElementById("icon-ornamen");
  if (icon_ornamen) {
    icon_ornamen.style.backgroundImage = `url('${iconOrnamen}')`;
  }
}

function settingValueOther() {
  const rightOrnamen = game.settings.get(
    "herald-bossbar-beta",
    "rightOrnamentImage"
  );
  let ornamentRight = document.getElementById("ornament-right");
  if (ornamentRight) {
    ornamentRight.style.backgroundImage = `url('${rightOrnamen}')`;
  }

  const leftOrnamen = game.settings.get(
    "herald-bossbar-beta",
    "leftOrnamentImage"
  );

  let ornamentLeft = document.getElementById("ornament-left");

  if (ornamentLeft) {
    ornamentLeft.style.backgroundImage = `url('${leftOrnamen}')`;
  }

  const tokenNameSize = game.settings.get(
    "herald-bossbar-beta",
    "tokenNameSize"
  );

  let tokenName = document.getElementById("name-token");
  if (tokenName) {
    tokenName.style.fontSize = tokenNameSize + "px";
  }
}
function updateSettingValue() {
  const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");
  if (!hasBossBar) return;
  settingValueHealthBar();
  settingValueEffectMystic();
  settingValueToken();
  settingValueOther();
}

export {
  toggleBossbar,
  checkerBossbar,
  updateSettingValue,
  GlobalChecker,
  changeImageOrnament,
  displayOrnamentBar,
  changeUniversalTimer,
};
