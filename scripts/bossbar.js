let GlobalTimerInterval = 1000;
let mysticActionImg = "/modules/herald-bossbar-beta/assets/mystic_action.webp";
function checkerBossbar() {
  setInterval(async () => {
    const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");
    if (hasBossBar && hasBossBar.show && hasBossBar.actorUuid) {
      await createBossbar();
    }
  }, 1000);
}

async function createBossbar() {
  const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");
  if (!hasBossBar) return;
  const currentActor = await fromUuid(hasBossBar.actorUuid);
  if (!currentActor) return;

  if (hasBossBar.show === true && hasBossBar.actorUuid) {
    createHpBar(currentActor);
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

function onBossbar() {
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
  canvas.scene.setFlag("world", "hasBossBar", {
    show: true,
    actorUuid: actor.uuid,
  });

  createHpBar(actor);
}

function offBossbar() {
  const existingBar = document.getElementById("boss-hp-bar");
  if (existingBar) {
    existingBar.remove();
  }
  canvas.scene.setFlag("world", "hasBossBar", {
    show: false,
    actorUuid: null,
  });
}

function createHpBar(actor) {
  const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");
  const existingBar = document.getElementById("boss-hp-bar");
  if (hasBossBar.show == true && existingBar != null) {
    return;
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
      updatePercent(actor);
      updateMysticAction(actor);
      updateEffects(actor);
      displayLegendaryAction(actor);
      displayLegendaryResistance(actor);
    })
    .catch((err) => {
      console.error("Gagal memuat template hpbar.html:", err);
    });
}

function updatePercent(actor) {
  const hp = actor.system.attributes.hp.value;
  const maxHp = actor.system.attributes.hp.max;
  const hpPercent = Math.ceil((hp / maxHp) * 100);

  let divHpPercent = document.getElementById("hp-percent");
  divHpPercent.innerText = hpPercent + "%";
}

function updateMysticAction(actor) {
  const mysticAction = actor.items.find((item) => item.name.includes("MA"));
  if (mysticAction) {
    let mysticDiv = document.getElementById("mystic-action");
    mysticDiv.innerHTML = `
    <div>
      <img id="maImg" src="${mysticActionImg}" class="maImg" alt="Mystic Action" />
    </div>
    `;
  }
}

function settingMysticAction(value) {
  document.querySelectorAll(".maImg").forEach((img) => {
    img.src = value;
  });

  mysticActionImg = value;
}

function updateEffects(actor) {
  let effectsDiv = document.getElementById("effects-container");
  let effectlist = ``;
  let showEffects = true;
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
  if (!legendaryAction) {
    return;
  }
  let legactDiv = document.getElementById("legact-container");

  let legactlist = ``;
  let showLegact = true;
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
        <img src="/modules/herald-bossbar-beta/assets/legact_off.webp" class="legact-effect" alt="off" />
      </div>`;
  }

  for (let i = 0; i < legendaryAction.value; i++) {
    legactlist += `
      <div>
        <img src="/modules/herald-bossbar-beta/assets/legact_on.webp" class="legact-effect" alt="active" />
      </div>`;
  }
  if (legactDiv) {
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
  let showLegres = true;
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
        <img src="/modules/herald-bossbar-beta/assets/legres_off.webp" class="legres-effect" alt="off" />
      </div>`;
  }

  for (let i = 0; i < legendaryResistance.value; i++) {
    legreslist += `
      <div>
        <img src="/modules/herald-bossbar-beta/assets/legres_on.webp" class="legres-effect" alt="active" />
      </div>`;
  }
  if (legresDiv) {
    legresDiv.innerHTML = legreslist;
  }
}

async function GlobalChecker() {
  const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");
  if (!hasBossBar) return;
  const currentActor = await fromUuid(hasBossBar.actorUuid);
  if (!currentActor) return;

  setInterval(() => {
    if (hasBossBar) {
      if (hasBossBar.show == true) {
        updateEffects(currentActor);
        updateMysticAction(currentActor);
        displayLegendaryResistance(currentActor);
        displayLegendaryAction(currentActor);
      }
    }
  }, GlobalTimerInterval);
}

Hooks.on("updateActor", async (actor, data) => {
  const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");
  if (!hasBossBar) return;
  const currentActor = await fromUuid(hasBossBar.actorUuid);
  if (!currentActor) return;
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
  updatePercent(currentActor);
  updateEffects(currentActor);
  updateMysticAction(currentActor);
  displayLegendaryResistance(currentActor);
  displayLegendaryAction(currentActor);
});

function updateSettingValue() {
  const hasBossBar = canvas.scene.getFlag("world", "hasBossBar");
  if (!hasBossBar) return;
  const hpBarImage = game.settings.get("herald-bossbar-beta", "hpBarImage");
  const tempHpBarImage = game.settings.get(
    "herald-bossbar-beta",
    "tempHpBarImage"
  );
  const hpBgImage = game.settings.get("herald-bossbar-beta", "hpBgImage");
  let hpbar = document.getElementById("hp-bar");
  let temphpbar = document.getElementById("temphp-bar");
  let hpbg = document.getElementById("hpbg");
  if (hpbar) {
    hpbar.style.backgroundImage = `url('${hpBarImage}')`;
  }
  if (temphpbar) {
    temphpbar.style.backgroundImage = `url('${tempHpBarImage}')`;
  }
  if (hpbg) {
    hpbg.style.backgroundImage = `url('${hpBgImage}')`;
  }

  const mysticAction = game.settings.get(
    "herald-bossbar-beta",
    "mysticActionImage"
  );
  let maImg = document.getElementById("maImg");
  if (maImg) {
    mysticActionImg = mysticAction;
  }

  const globalTimer = game.settings.get("herald-bossbar-beta", "globalTimer");
  GlobalTimerInterval = globalTimer;

  const bgOrnamen = game.settings.get("herald-bossbar-beta", "bgOrnamenImage");
  const iconOrnamen = game.settings.get(
    "herald-bossbar-beta",
    "iconOrnamenImage"
  );

  let bg_ornamen = document.getElementById("bg-ornamen");
  let icon_ornamen = document.getElementById("icon-ornamen");

  if (bg_ornamen) {
    bg_ornamen.style.backgroundImage = `url('${bgOrnamen}')`;
  }
  if (icon_ornamen) {
    icon_ornamen.style.backgroundImage = `url('${iconOrnamen}')`;
  }

  const leftOrnamen = game.settings.get(
    "herald-bossbar-beta",
    "leftOrnamentImage"
  );
  const rightOrnamen = game.settings.get(
    "herald-bossbar-beta",
    "rightOrnamentImage"
  );

  let ornamentLeft = document.getElementById("ornament-left");
  let ornamentRight = document.getElementById("ornament-right");

  if (ornamentLeft) {
    ornamentLeft.style.backgroundImage = `url('${leftOrnamen}')`;
  }
  if (ornamentRight) {
    ornamentRight.style.backgroundImage = `url('${rightOrnamen}')`;
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

export {
  toggleBossbar,
  checkerBossbar,
  updateSettingValue,
  GlobalChecker,
  settingMysticAction,
};
