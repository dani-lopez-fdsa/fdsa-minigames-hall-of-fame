(() => {
  const authorStage = document.querySelector('.author-stage');
  const authorCard = document.querySelector('.author-card');
  const authorPortraitWrap = document.querySelector('.author-portrait-wrap');
  const authorPortrait = document.querySelector('.author-portrait');
  const authorMark = document.querySelector('.author-mark');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (authorStage && authorCard && authorPortraitWrap && authorPortrait && authorMark && !reduceMotion) {
    const portraitFlyer = document.createElement('img');
    portraitFlyer.className = 'author-flyer author-flyer--portrait';
    portraitFlyer.src = authorPortrait.currentSrc || authorPortrait.src;
    portraitFlyer.alt = '';
    portraitFlyer.setAttribute('aria-hidden', 'true');

    const rocketFlyer = document.createElement('span');
    rocketFlyer.className = 'author-flyer author-flyer--rocket';
    rocketFlyer.textContent = '🚀';
    rocketFlyer.setAttribute('aria-hidden', 'true');

    document.body.append(portraitFlyer, rocketFlyer);
    document.documentElement.classList.add('has-author-flight');
    authorStage.style.setProperty('--author-handoff', '0');

    const clamp = value => Math.min(1, Math.max(0, value));
    const lerp = (start, end, progress) => start + (end - start) * progress;
    let authorTicking = false;
    const updateAuthorAssembly = () => {
      const rect = authorStage.getBoundingClientRect();
      const stickyTop = Number.parseFloat(getComputedStyle(authorCard).top) || 0;
      const stageTop = rect.top + window.scrollY;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
      const availableScroll = maxScroll - (stageTop - stickyTop);
      const naturalDistance = rect.height - authorCard.offsetHeight;
      const distance = Math.max(Math.min(naturalDistance, availableScroll - 24), 1);
      const progress = clamp((stickyTop - rect.top) / distance);
      const flightProgress = clamp(window.scrollY / Math.max(maxScroll, 1));
      const handoff = clamp((flightProgress - 0.94) / 0.06);
      authorStage.style.setProperty('--author-progress', progress.toFixed(4));
      authorStage.style.setProperty('--author-handoff', handoff.toFixed(4));
      authorStage.classList.toggle('is-built', progress > 0.995);

      const portraitTarget = authorPortraitWrap.getBoundingClientRect();
      const cardTarget = authorCard.getBoundingClientRect();
      const markTarget = authorMark.getBoundingClientRect();
      const markStyles = getComputedStyle(authorMark);
      const markPaddingLeft = Number.parseFloat(markStyles.paddingLeft) || 0;
      const markPaddingTop = Number.parseFloat(markStyles.paddingTop) || 0;
      const isMobile = window.innerWidth <= 800;
      const portraitStartScale = isMobile ? 0.24 : 0.3;
      const portraitScale = lerp(portraitStartScale, 1, flightProgress);
      const portraitStartX = window.innerWidth - portraitTarget.width * portraitStartScale - 26;
      const portraitLandingY = lerp(stickyTop + 1, portraitTarget.top, handoff);
      const portraitX = lerp(portraitStartX, portraitTarget.left, flightProgress)
        - Math.sin(flightProgress * Math.PI) * window.innerWidth * 0.07;
      const portraitY = lerp(-portraitTarget.height * portraitStartScale * 0.78, portraitLandingY, flightProgress);
      const portraitRotation = lerp(7, 0, flightProgress);
      portraitFlyer.style.width = `${portraitTarget.width}px`;
      portraitFlyer.style.height = `${portraitTarget.height}px`;
      portraitFlyer.style.opacity = (1 - handoff).toFixed(4);
      portraitFlyer.style.transform = `translate3d(${portraitX}px,${portraitY}px,0) rotate(${portraitRotation}deg) scale(${portraitScale})`;

      const rocketBaseX = cardTarget.right - markTarget.width + markPaddingLeft;
      const rocketLandingX = lerp(rocketBaseX, markTarget.left + markPaddingLeft, handoff);
      const rocketBaseY = stickyTop + (isMobile ? 368 : 1) + markPaddingTop;
      const rocketLandingY = lerp(rocketBaseY, markTarget.top + markPaddingTop, handoff);
      const rocketX = lerp(window.innerWidth * 0.46, rocketLandingX, flightProgress)
        + Math.sin(flightProgress * Math.PI) * window.innerWidth * 0.05;
      const rocketY = lerp(isMobile ? -58 : -82, rocketLandingY, flightProgress);
      const rocketScale = lerp(isMobile ? 0.68 : 0.62, 1, flightProgress);
      const rocketRotation = lerp(-38, 0, flightProgress);
      rocketFlyer.style.opacity = (1 - handoff).toFixed(4);
      rocketFlyer.style.transform = `translate3d(${rocketX}px,${rocketY}px,0) rotate(${rocketRotation}deg) scale(${rocketScale})`;
      authorTicking = false;
    };
    const requestAuthorUpdate = () => {
      if (!authorTicking) {
        authorTicking = true;
        requestAnimationFrame(updateAuthorAssembly);
      }
    };
    window.addEventListener('scroll', requestAuthorUpdate, { passive: true });
    window.addEventListener('resize', requestAuthorUpdate, { passive: true });
    updateAuthorAssembly();
  }

  const canvas = document.querySelector('#arcade-scene');
  if (!canvas || reduceMotion || !window.THREE) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (_) {
    return;
  }

  document.documentElement.classList.add('has-webgl');
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x10120f, 0.055);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
  camera.position.set(0, 0, 12);

  const world = new THREE.Group();
  scene.add(world);

  const orange = new THREE.MeshStandardMaterial({ color: 0xff5d28, roughness: 0.3, metalness: 0.25 });
  const violet = new THREE.MeshStandardMaterial({ color: 0x7557ff, roughness: 0.25, metalness: 0.45 });
  const lime = new THREE.MeshStandardMaterial({ color: 0xc8ff2e, roughness: 0.42, metalness: 0.1 });
  const darkWire = new THREE.MeshBasicMaterial({ color: 0x7557ff, wireframe: true, transparent: true, opacity: 0.45 });

  const heroObject = new THREE.Group();
  heroObject.position.set(3.2, 0.2, 0);
  world.add(heroObject);

  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.5, 0.34, 150, 18, 2, 3), violet);
  knot.rotation.x = 0.7;
  heroObject.add(knot);

  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 1), orange);
  heroObject.add(core);

  const halo = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.035, 10, 100), lime);
  halo.rotation.set(1.1, 0.3, 0.2);
  heroObject.add(halo);

  const wireOrb = new THREE.Mesh(new THREE.IcosahedronGeometry(3.5, 2), darkWire);
  wireOrb.position.set(-5.3, -3.7, -4);
  world.add(wireOrb);

  const blocks = new THREE.Group();
  const blockGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
  for (let i = 0; i < 14; i += 1) {
    const material = i % 3 === 0 ? orange : i % 3 === 1 ? violet : lime;
    const block = new THREE.Mesh(blockGeometry, material);
    const angle = i * 2.399;
    const radius = 4.5 + (i % 4) * 1.15;
    block.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.65, -3 - (i % 5) * 2.2);
    block.rotation.set(angle, angle * 0.7, angle * 0.35);
    block.scale.setScalar(0.45 + (i % 3) * 0.22);
    blocks.add(block);
  }
  world.add(blocks);

  const particleCount = window.innerWidth < 800 ? 260 : 650;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const palette = [new THREE.Color(0xc8ff2e), new THREE.Color(0xff5d28), new THREE.Color(0x7557ff)];
  for (let i = 0; i < particleCount; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
    positions[i * 3 + 2] = -Math.random() * 35 + 6;
    const color = palette[i % palette.length];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const particles = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, opacity: 0.78 }));
  world.add(particles);

  scene.add(new THREE.HemisphereLight(0xf1efdf, 0x10120f, 1.5));
  const keyLight = new THREE.PointLight(0xc8ff2e, 30, 18);
  keyLight.position.set(4, 4, 6);
  scene.add(keyLight);
  const fillLight = new THREE.PointLight(0xff5d28, 26, 16);
  fillLight.position.set(-5, -2, 4);
  scene.add(fillLight);

  let targetScroll = 0;
  let smoothScroll = 0;
  let pointerX = 0;
  let pointerY = 0;

  const resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    heroObject.position.x = width < 800 ? 2.4 : 3.2;
  };

  const updateScroll = () => {
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    targetScroll = window.scrollY / max;
  };

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('pointermove', event => {
    pointerX = event.clientX / window.innerWidth - 0.5;
    pointerY = event.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.stats,.panel').forEach(element => {
      element.classList.add('reveal-target');
      revealObserver.observe(element);
    });
  }

  const clock = new THREE.Clock();
  const animate = () => {
    const elapsed = clock.getElapsedTime();
    smoothScroll += (targetScroll - smoothScroll) * 0.055;
    const travel = smoothScroll * Math.PI * 2;

    camera.position.z = 12 - smoothScroll * 5.5;
    camera.position.x += ((Math.sin(travel) * 1.4 + pointerX * 0.45) - camera.position.x) * 0.035;
    camera.position.y += ((Math.cos(travel * 0.7) * 0.65 - pointerY * 0.3) - camera.position.y) * 0.035;
    camera.lookAt(0, 0, -smoothScroll * 12);

    heroObject.position.z = -smoothScroll * 18;
    heroObject.position.y = 0.2 + Math.sin(travel) * 2.4;
    heroObject.rotation.x = elapsed * 0.12 + travel * 0.55;
    heroObject.rotation.y = elapsed * 0.18 + travel * 1.2;
    knot.rotation.z = elapsed * 0.24;
    core.rotation.y = -elapsed * 0.45;
    halo.rotation.z = elapsed * 0.12;

    blocks.rotation.z = -travel * 0.18;
    blocks.position.z = smoothScroll * 6;
    blocks.children.forEach((block, index) => {
      block.rotation.x += 0.002 + index * 0.00008;
      block.rotation.y += 0.004;
    });
    wireOrb.rotation.x = elapsed * 0.035 + travel * 0.2;
    wireOrb.rotation.y = elapsed * 0.05;
    wireOrb.position.x = -5.3 + Math.sin(travel) * 3;
    wireOrb.position.y = -3.7 + smoothScroll * 7;
    particles.position.z = smoothScroll * 16;
    particles.rotation.z = elapsed * 0.008;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  resize();
  updateScroll();
  animate();
})();
