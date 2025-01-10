let universalTimerInterfal = 1000;
let mysticActionImg = "/modules/herald-bossbar/assets/mystic_action.webp";
let legactOnImg = "/modules/herald-bossbar/assets/legact_on.webp";
let legactOffImg = "/modules/herald-bossbar/assets/legact_off.webp";
let legresOnImg = "/modules/herald-bossbar/assets/legres_on.webp";
let legresOffImg = "/modules/herald-bossbar/assets/legres_off.webp";

let showHpPercent = "percentage";
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
    const existingBar = document.getElementById("heraldBossbar");
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

  const existingBar = document.getElementById("heraldBossbar");
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
  const existingBar = document.getElementById("heraldBossbar");
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
  const existingBar = document.getElementById("heraldBossbar");

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

  fetch("/modules/herald-bossbar/templates/wbhpbar.html")
    .then((response) => response.text())
    .then((html) => {
      const div = document.createElement("div");
      div.innerHTML = html;

      const tokenImage = div.querySelector("#heraldBossbar-imagetoken");
      const hpBar = div.querySelector("#heraldBossbar-wbhpbar");
      const bghpBar = div.querySelector("#heraldBossbar-wbbghpbar");
      const tempHpBar = div.querySelector("#heraldBossbar-wbtemphpbar");
      const bgtempHpBar = div.querySelector("#heraldBossbar-wbbgtemphpbar");
      const tokenName = div.querySelector("#heraldBossbar-nametoken");

      tokenImage.src = actor.img;
      tokenName.textContent = actor.name;
      tempHpBar.style.width = `${tempHpPercent}%`;
      bgtempHpBar.style.width = `${tempHpPercent}%`;
      hpBar.style.width = `${hpPercent}%`;
      bghpBar.style.width = `${hpPercent}%`;
      div.firstChild.id = "heraldBossbar";

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
  const existingBar = document.getElementById("heraldBossbar");

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

  fetch("/modules/herald-bossbar/templates/hpbar.html")
    .then((response) => response.text())
    .then((html) => {
      const div = document.createElement("div");
      div.innerHTML = html;

      const tokenImage = div.querySelector("#heraldBossbar-imagetoken");
      const hpBar = div.querySelector("#heraldBossbar-hpbar");
      const bghpBar = div.querySelector("#heraldBossbar-bghpbar");
      const tempHpBar = div.querySelector("#heraldBossbar-temphpbar");
      const bgtempHpBar = div.querySelector("#heraldBossbar-bgtemphpbar");
      const tokenName = div.querySelector("#heraldBossbar-nametoken");

      tokenImage.src = actor.img;
      tokenName.textContent = actor.name;
      tempHpBar.style.width = `${tempHpPercent}%`;
      bgtempHpBar.style.width = `${tempHpPercent}%`;
      hpBar.style.width = `${hpPercent}%`;
      bghpBar.style.width = `${hpPercent}%`;
      div.firstChild.id = "heraldBossbar";

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
  let divHpPercent = document.getElementById("heraldBossbar-hpvalue");
  if (status == "weaknessBroken") {
    divHpPercent = document.getElementById("heraldBossbar-wbhpvalue");
  }

  if (showHpPercent == "none") {
    divHpPercent.innerText = "";
    return;
  }
  if (divHpPercent) {
    if (showHpPercent == "percentage") {
      divHpPercent.innerText = hpPercent + "%";
    }
    if (showHpPercent == "value") {
      divHpPercent.innerText = hp + "/" + maxHp;
    }
  }
}

function updateTempMax(actor) {
  const tempHp = actor.system.attributes.hp.temp || 0;
  const tempHpPercent = (tempHp / tempHpMax) * 100;
  let divTempMax = document.getElementById("heraldBossbar-wbtempmax");

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
  let mysticDiv = document.getElementById("heraldBossbar-mysticaction");
  if (mysticDiv) {
    if (showMA == false) {
      mysticDiv.innerHTML = "";
      return;
    }
    if (mysticAction) {
      mysticDiv.innerHTML = `
      <div>
        <img id="heraldBossbar-maimage" src="${mysticActionImg}" class="heraldBossbar-maimage" alt="Mystic Action" />
      </div>
      `;
    }
  }
}

function updateEffects(actor) {
  let effectsDiv = document.getElementById("heraldBossbar-effectscontainer");
  if (!effectsDiv) return;

  effectsDiv.innerHTML = "";

  if (showEffects) {
    let arrEffect = [];
    for (let effect of actor.effects) {
      arrEffect.push(effect);
    }

    for (let item of actor.items) {
      if (item.effects) {
        for (let effect of item.effects) {
          arrEffect.push(effect);
        }
      }
    }

    arrEffect.forEach((effect) => {
      if (effect.target !== actor) {
        return;
      }

      const effectDiv = document.createElement("div");
      effectDiv.classList.add("effect-item");

      const effectContainer = document.createElement("div");
      effectContainer.classList.add("heraldBossbar-effectdetailcontainer");
      effectContainer.innerHTML = `
      <img src="${effect.img}" alt="${effect.name}" class="heraldBossbar-tokeneffect" />
      `;
      const stackDiv = document.createElement("div");
      stackDiv.classList.add("heraldBossbar-stackeffect");
      if (/\(\d+\)/.test(effect.name)) {
        const match = effect.name.match(/\((\d+)\)/);
        if (match) {
          const number = parseInt(match[1], 10);
          stackDiv.innerText = number;
        }
      }

      const effectDetailDiv = document.createElement("div");
      effectDetailDiv.classList.add("effect-detail");
      let durationDiv = "";
      if (effect.duration.rounds > 0) {
        durationDiv = ` <div class="heraldbossbar-detaileffectduration"> ${
          effect.duration.rounds + " rounds"
        }</div>`;
      }
      effectDetailDiv.innerHTML = `
       <div class="heraldBossbar-effecttooltip">
          <h3>${effect.name}
          </h3>
          <div>
           <div>${effect.description}</div>
          </div>
         
        <div id="heraldbossbar-detaileffectbot" class="heraldbossbar-detaileffectbot">
          <div id="heraldbossbar-detaileffecttype" class="heraldbossbar-detaileffecttype"> ${
            effect.isTemporary ? "Temporary" : "Passive"
          }</div>
           ${durationDiv}
        </div>
      </div>`;
      effectDetailDiv.style.display = "none";
      effectDiv.addEventListener("mouseenter", () => {
        effectDetailDiv.style.display = "block";
      });
      effectDiv.addEventListener("mouseleave", () => {
        effectDetailDiv.style.display = "none";
      });

      effectDiv.appendChild(effectContainer);
      effectContainer.appendChild(stackDiv);
      effectDiv.appendChild(effectDetailDiv);
      effectsDiv.appendChild(effectDiv);
    });
  }
}

function displayLegendaryAction(actor) {
  const legendaryAction = actor.system.resources.legact || null;
  let legactlist = `<div class="heraldBossbar-legacteffect"></div>`;
  if (!legendaryAction) {
    return;
  }

  if (legendaryAction.max == 0) {
    legactlist = `<div class="heraldBossbar-legacteffect"></div>`;
  }

  let legactDiv = document.getElementById("heraldBossbar-legactcontainer");

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
          <img src="${legactOffImg}" class="heraldBossbar-legacteffect" alt="off" />
        </div>`;
    }

    for (let i = 0; i < legendaryAction.value; i++) {
      legactlist += `
        <div>
          <img src="${legactOnImg}" class="heraldBossbar-legacteffect" alt="active" />
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
  let legresDiv = document.getElementById("heraldBossbar-legrescontainer");

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
          <img src="${legresOffImg}" class="heraldBossbar-legreseffect" alt="off" />
        </div>`;
    }

    for (let i = 0; i < legendaryResistance.value; i++) {
      legreslist += `
        <div>
          <img src="${legresOnImg}" class="heraldBossbar-legreseffect" alt="active" />
        </div>`;
    }
    legresDiv.innerHTML = legreslist;
  }
}

async function changeShapeBossBar(value) {
  let hpbg = document.getElementById("heraldBossbar-hpbg");
  let wbhpbg = document.getElementById("heraldBossbar-wbhpbg");
  let wbtemphpbg = document.getElementById("heraldBossbar-wbtemphpbg");

  if (hpbg) {
    hpbg.style.transform = "";
    hpbg.style.clipPath = "";
  }
  if (wbhpbg) {
    wbhpbg.style.transform = "";
    wbhpbg.style.clipPath = "";
  }
  if (wbtemphpbg) {
    wbtemphpbg.style.transform = "";
    wbtemphpbg.style.clipPath = "";
  }

  if (value == "rectangle") {
    if (hpbg) {
      hpbg.style.transform = "skewX(0deg)";
    }
    if (wbhpbg) {
      wbhpbg.style.transform = "skewX(0deg)";
    }
    if (wbtemphpbg) {
      wbtemphpbg.style.transform = "skewX(0deg)";
    }
  }
  if (value == "parallelogram") {
    if (hpbg) {
      hpbg.style.transform = "skewX(-40deg)";
    }
    if (wbhpbg) {
      wbhpbg.style.transform = "skewX(-40deg)";
    }
    if (wbtemphpbg) {
      wbtemphpbg.style.transform = "skewX(-40deg)";
    }
  }
  if (value == "hexagon") {
    if (hpbg) {
      hpbg.style.clipPath =
        "polygon(1% 0%,99% 0%, 100% 50%,99% 100%,1% 100%,0% 50%)";
    }
    if (wbhpbg) {
      wbhpbg.style.clipPath =
        "polygon(1% 0%,99% 0%, 100% 50%,99% 100%,1% 100%,0% 50%)";
    }
    if (wbtemphpbg) {
      wbtemphpbg.style.clipPath =
        "polygon(1% 0%,99% 0%, 100% 50%,99% 100%,1% 100%,0% 50%)";
    }
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
      .getElementById("heraldBossbar")
      ?.querySelector("#heraldBossbar-wbhpbar");
    const bghpBar = document
      .getElementById("heraldBossbar")
      ?.querySelector("#heraldBossbar-wbbghpbar");

    const tempHpBar = document
      .getElementById("heraldBossbar")
      ?.querySelector("#heraldBossbar-wbtemphpbar");

    const bgtempHpBar = document
      .getElementById("heraldBossbar")
      ?.querySelector("#heraldBossbar-wbbgtemphpbar");
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
      .getElementById("heraldBossbar")
      ?.querySelector("#heraldBossbar-hpbar");
    const bghpBar = document
      .getElementById("heraldBossbar")
      ?.querySelector("#heraldBossbar-bghpbar");

    const tempHpBar = document
      .getElementById("heraldBossbar")
      ?.querySelector("#heraldBossbar-temphpbar");

    const bgtempHpBar = document
      .getElementById("heraldBossbar")
      ?.querySelector("#heraldBossbar-bgtemphpbar");
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
  const hpBarImage = game.settings.get("herald-bossbar", "hpBarImage");
  let hpbar = document.getElementById("heraldBossbar-hpbar");
  if (hpbar) {
    hpbar.style.backgroundImage = `url('${hpBarImage}')`;
  }
  const hpbarBg = game.settings.get("herald-bossbar", "bgHpColor");
  let bg_hpBar = document.getElementById("heraldBossbar-bghpbar");
  if (bg_hpBar) {
    bg_hpBar.style.backgroundColor = hpbarBg;
  }

  const tempHpBarImage = game.settings.get("herald-bossbar", "tempHpBarImage");
  let temphpbar = document.getElementById("heraldBossbar-temphpbar");
  if (temphpbar) {
    temphpbar.style.backgroundImage = `url('${tempHpBarImage}')`;
  }

  const temphpbarBg = game.settings.get("herald-bossbar", "bgTempHpColor");
  let bg_temphpBar = document.getElementById("heraldBossbar-bgtemphpbar");
  if (bg_temphpBar) {
    bg_temphpBar.style.backgroundColor = temphpbarBg;
  }

  const hpBgImage = game.settings.get("herald-bossbar", "hpBgImage");
  let hpbg = document.getElementById("heraldBossbar-hpbg");

  if (hpbg) {
    hpbg.style.backgroundImage = `url('${hpBgImage}')`;
  }

  const hpBarShape = game.settings.get("herald-bossbar", "hpBarShape");
  changeShapeBossBar(hpBarShape);

  const percentValue = game.settings.get("herald-bossbar", "showHpAmount");
  displayOrnamentBar("hpPercent", percentValue);
}

function settingValueEffectMystic() {
  const effectsValue = game.settings.get("herald-bossbar", "showEffects");
  displayOrnamentBar("effects", effectsValue);
  const legactValue = game.settings.get("herald-bossbar", "showLegact");
  displayOrnamentBar("legact", legactValue);
  const legresValue = game.settings.get("herald-bossbar", "showLegres");
  displayOrnamentBar("legres", legresValue);

  // let showMA = true;
  const legactOnImg = game.settings.get("herald-bossbar", "legactOnImg");
  changeImageOrnament("legactOn", legactOnImg);
  const legactOffImg = game.settings.get("herald-bossbar", "legactOffImg");
  changeImageOrnament("legactOff", legactOffImg);
  const legresOnImg = game.settings.get("herald-bossbar", "legresOnImg");
  changeImageOrnament("legresOn", legresOnImg);
  const legresOffImg = game.settings.get("herald-bossbar", "legresOffImg");
  changeImageOrnament("legresOff", legresOffImg);
  const mysticAction = game.settings.get("herald-bossbar", "mysticActionImage");
  changeImageOrnament("mysticAction", mysticAction);

  const timerInterfal = game.settings.get(
    "herald-bossbar",
    "universalTimerInterfal"
  );
  universalTimerInterfal = timerInterfal;
}

function settingValueToken() {
  const tokenGlowColor = game.settings.get("herald-bossbar", "tokenGlowColor");
  let tokenGlow = document.getElementById("heraldBossbar-imagetoken");
  if (tokenGlow) {
    tokenGlow.style.boxShadow = `0 0 10px 5px ${tokenGlowColor}`;
  }

  const bgOrnamen = game.settings.get("herald-bossbar", "bgOrnamenImage");
  let bg_ornamen = document.getElementById("heraldBossbar-bgornament");
  if (bg_ornamen) {
    bg_ornamen.style.backgroundImage = `url('${bgOrnamen}')`;
  }

  const rotationOrnamen = game.settings.get(
    "herald-bossbar",
    "rotationOrnamen"
  );
  if (bg_ornamen) {
    bg_ornamen.style.animation = `heraldBossbar-rotateOrnament ${rotationOrnamen}ms linear infinite`;
  }

  const iconOrnamen = game.settings.get("herald-bossbar", "iconOrnamenImage");
  let icon_ornamen = document.getElementById("heraldBossbar-iconornament");
  if (icon_ornamen) {
    icon_ornamen.style.backgroundImage = `url('${iconOrnamen}')`;
  }
}

function settingValueOther() {
  const rightOrnamen = game.settings.get(
    "herald-bossbar",
    "rightOrnamentImage"
  );
  let ornamentRight = document.getElementById("heraldBossbar-rightornament");
  if (ornamentRight) {
    ornamentRight.style.backgroundImage = `url('${rightOrnamen}')`;
  }

  const leftOrnamen = game.settings.get("herald-bossbar", "leftOrnamentImage");

  let ornamentLeft = document.getElementById("heraldBossbar-leftornament");

  if (ornamentLeft) {
    ornamentLeft.style.backgroundImage = `url('${leftOrnamen}')`;
  }

  const tokenNameSize = game.settings.get("herald-bossbar", "tokenNameSize");

  let tokenName = document.getElementById("heraldBossbar-nametoken");
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
  changeShapeBossBar,
};
