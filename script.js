// Shared motion preference; all interactions remain usable without animation.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const surfaceEase = 'cubic-bezier(.22,1,.36,1)';
const content = {


  letter: {type:'微信公众号 / 示例文章',title:'给这个小站的第一封信',paragraphs:['先留一个位置。','这个小站暂时还没有很多内容。想做的事、随手记下的片段、做了一半的小实验，都可以从这里慢慢开始。','等过一段时间再回来看，希望能看见一些变化。也许是一篇写完的记录，也许是一个终于做出来的小东西。','第一步，就是让它有一个开始。'],notice:'这是一篇示例短文，之后可替换为你的第一篇记录。'},
  curiosity: {type:'人人都是产品经理 / 示例文章',title:'最近在关注什么',paragraphs:['有些问题还没有答案，但值得先记下来。','最近读到的一段话，用过的一个工具，或日常生活中一个小小的不方便，都可能成为下一次探索的起点。','这里可以用来收集这些片段。不必每次都写成长文章，几句话也很好。'],notice:'这是一篇示例短文，之后可替换为你的真实记录。'},
};
const dialog = document.querySelector('#detail');
let dialogMotion;
let dialogClosing = false;
function animateDialog(closing = false) {
  const current = getComputedStyle(dialog);
  const from = {opacity:current.opacity, transform:current.transform};
  const interrupted = Boolean(dialogMotion);
  dialogMotion?.cancel();
  dialogClosing = closing;
  dialog.classList.toggle('is-closing', closing);
  if (motionPreference.matches) {
    dialogMotion = null;
    if (closing) dialog.close();
    return;
  }
  const start = closing || interrupted ? from : {opacity:0, transform:'translateY(18px) scale(.97)'};
  const finish = closing ? {opacity:0, transform:'translateY(10px) scale(.98)'} : {opacity:1, transform:'translateY(0) scale(1)'};
  const animation = dialog.animate([start, finish], {duration:closing ? 180 : 360, easing:surfaceEase, fill:'both'});
  dialogMotion = animation;
  animation.onfinish = () => {
    if (dialogMotion !== animation) return;
    if (closing) dialog.close();
    animation.cancel();
    dialogMotion = null;
    dialogClosing = false;
    dialog.classList.remove('is-closing');
  };
}
function dismissDialog() { if (dialog.open && !dialogClosing) animateDialog(true); }
dialog.addEventListener('cancel', event => {event.preventDefault(); dismissDialog();});
dialog.addEventListener('close', () => {
  dialogMotion?.cancel(); dialogMotion = null; dialogClosing = false;
  dialog.classList.remove('is-closing');
});
motionPreference.addEventListener('change', () => {
  if (!motionPreference.matches) return;
  dialogMotion?.cancel(); dialogMotion = null;
  if (dialogClosing) dialog.close();
  dialogClosing = false; dialog.classList.remove('is-closing');
  document.querySelectorAll('.project-panel,.deck-preview,.note-pages .note').forEach(el => el.getAnimations().forEach(a => a.cancel()));
});
document.querySelectorAll('[data-dialog]').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.dataset.dialog === 'project' ? projects[projectIndex].detail : content[button.dataset.dialog];
    document.querySelector('#dialog-type').textContent = item.type;
    document.querySelector('#dialog-title').textContent = item.title;
    const body = document.querySelector('#dialog-content');
    body.replaceChildren();
    item.paragraphs.forEach(text => {const p=document.createElement('p');p.textContent=text;body.append(p);});
    const note=document.createElement('p');note.className='disclaimer';note.textContent=item.notice;body.append(note);
    dialog.showModal();
    animateDialog();
  });
});
document.querySelector('.close').addEventListener('click', dismissDialog);
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dismissDialog();}});
const navLinks=[...document.querySelectorAll('nav a')];
const sections=[...document.querySelectorAll('main>section')];
let scheduled=false;
function updateNav(){const anchor=window.innerHeight*.35;let current=sections[0].id;sections.forEach(section=>{if(section.getBoundingClientRect().top<=anchor)current=section.id;});if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-4)current='contact';navLinks.forEach(link=>{if(link.hash==='#'+current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});scheduled=false;}
window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateNav);}},{passive:true});
updateNav();

const copyWechat = document.querySelector('.copy-wechat');
const contactStatus = document.querySelector('.contact-status');
const contactStatusText = contactStatus.querySelector('.contact-status-text');
const connectionGreetings = {
  standard: { title: ['很高兴认识你'], lines: ['我们可以', '聊聊 AI', '聊聊产品', '聊聊未来'] },
  earth: { title: ['很高兴', '在这颗星球上遇见你'], lines: ['愿世界和平', '愿每一个平凡的日子都值得期待'] }
};
const connectionGreetingsSeen = new Set();
function prepareConnectionGreeting(variant) {
  const greeting = connectionGreetings[variant];
  connectionToast.dataset.greeting = variant;
  const title = connectionToast.querySelector('.connection-message');
  const letter = connectionToast.querySelector('.connection-letter');
  title.replaceChildren(...greeting.title.map(line => {
    const span = document.createElement('span'); span.textContent = line; return span;
  }));
  letter.replaceChildren();
  greeting.lines.forEach((line, index) => {
    const span = document.createElement('span'); span.textContent = line;
    if (variant === 'standard' && index > 0) {
      let topics = letter.querySelector('.connection-topics');
      if (!topics) { topics = document.createElement('span'); topics.className = 'connection-topics'; letter.append(topics); }
      topics.append(span);
    } else letter.append(span);
  });
  return [...greeting.title, ...greeting.lines, '刘禹博'].join(' ');
}
const connectionToast = document.querySelector('.connection-toast');
const connectionDismiss = connectionToast.querySelector('.connection-dismiss');
const connectionTitle = document.querySelector('#contact-title');
let connectionTrigger = copyWechat;
let toastTimer, toastMotion;
function hideConnectionToast() {
  clearTimeout(toastTimer);
  if (connectionToast.hidden) return;
  if (connectionToast.contains(document.activeElement)) connectionTrigger.focus({preventScroll:true});
  toastMotion?.cancel();
  document.body.classList.remove('connection-active');
  if (motionPreference.matches) { connectionToast.hidden = true; return; }
  const animation = connectionToast.animate([{opacity:1},{opacity:0}],{duration:280,easing:'ease-in',fill:'both'});
  toastMotion = animation;
  animation.onfinish = () => { connectionToast.hidden = true; animation.cancel(); toastMotion = null; };
}
function showConnectionToast(trigger = copyWechat) {
  connectionTrigger = trigger;
  clearTimeout(toastTimer);
  toastMotion?.cancel();
  connectionToast.hidden = false;
  document.body.classList.add('connection-active');
  toastTimer = setTimeout(hideConnectionToast, 8000);
}
function replayConnectionGreeting() {
  const variant = document.documentElement.dataset.appearance === 'desktop' ? 'earth' : 'standard';
  prepareConnectionGreeting(variant);
  // Restart the same entrance even when the previous greeting is still fading out.
  connectionToast.hidden = true;
  void connectionToast.offsetHeight;
  showConnectionToast(connectionTitle);
}
connectionTitle.addEventListener('click', replayConnectionGreeting);
connectionTitle.addEventListener('keydown', event => {
  if (event.key === 'Enter') { event.preventDefault(); replayConnectionGreeting(); }
});
connectionDismiss.addEventListener('click', hideConnectionToast);
document.addEventListener('pointerdown', event => {
  if (!connectionToast.hidden && !connectionToast.contains(event.target)) hideConnectionToast();
});
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !connectionToast.hidden) hideConnectionToast(); });
motionPreference.addEventListener('change', () => { if (motionPreference.matches) { toastMotion?.finish(); } });
let copyReset, copyPending = false;
copyWechat.addEventListener('click', async () => {
  if (copyPending) return;
  copyPending = true;
  copyWechat.setAttribute('aria-busy', 'true');
  const value = document.querySelector('#wechat-id').textContent.trim();
  clearTimeout(copyReset);
  try {
    await navigator.clipboard.writeText(value);
    // Only a successful copy consumes this quiet, one-time greeting.
    const variant = document.documentElement.dataset.appearance === 'desktop' ? 'earth' : 'standard';
    const greetingKey = `liuyubo-connection-greeting-v8-${variant}-seen`;
    let seen = connectionGreetingsSeen.has(variant);
    try { seen ||= localStorage.getItem(greetingKey) === '1'; } catch {}
    const firstConnection = !seen;
    connectionGreetingsSeen.add(variant);
    try { localStorage.setItem(greetingKey, '1'); } catch {}
    copyWechat.querySelector('.copy-label').textContent = '已复制';
    contactStatus.classList.toggle('is-connection', firstConnection);
    contactStatusText.textContent = firstConnection
      ? `微信号已复制 ${prepareConnectionGreeting(variant)}`
      : '微信号已复制，打开微信搜索即可添加。';
    if (firstConnection) showConnectionToast();
    else hideConnectionToast();
    copyReset = setTimeout(() => {
      copyWechat.querySelector('.copy-label').textContent = '复制微信号';
      contactStatusText.textContent = '';
      contactStatus.classList.remove('is-connection');
    }, firstConnection ? 8300 : 4000);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('#wechat-id'));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyWechat.querySelector('.copy-label').textContent = '复制微信号';
    contactStatus.classList.remove('is-connection');
    contactStatusText.textContent = '微信号已选中，请长按或使用系统复制快捷键。';
  } finally {
    copyPending = false;
    copyWechat.removeAttribute('aria-busy');
  }
});

const projects = [
  {
    name:'DocAI',stage:'本地开发版',badge:'本地开发版',
    summary:'上传文档后，直接向 AI 提问、总结重点，并查看答案来源。',
    category:'AI 应用 / 文档问答',
    repository:'https://github.com/liuyvbo2026/docai',
    cover:'assets/project-docai-real.png',coverAlt:'DocAI 实际运行的文档提问首页',
    caption:'真实界面 · 本地运行截图',footnote:'基于 AnythingLLM 二次开发',
    images:[
      {src:'assets/project-docai-home-hd.png',title:'开始提问',alt:'DocAI 完整首页：导航、资料库与提问输入区',width:2200,height:1440},
      {src:'assets/project-docai-library-hd.png',title:'管理资料',alt:'DocAI 完整资料管理界面：查看和添加演示文档',width:2200,height:1440},
      {src:'assets/project-docai-answer-hd.png',title:'对话界面',alt:'DocAI 完整对话界面：将会议记录整理成待办事项',width:2200,height:1440}
    ]
  },
  {name:'智能制造协同平台',stage:'示例方案',summary:'为生产团队集中管理任务与现场异常，让处理进度更容易追踪。',category:'智能制造 / 业务协同',role:'待补充',work:'流程梳理 · 任务协同',result:'待补充',cover:'assets/project-manufacturing.svg',detail:{type:'PROJECT / 01 · 示例',title:'智能制造协同平台',paragraphs:['场景设想：生产任务与现场异常分散在多个沟通渠道，进度难以追踪。','方案示例：通过统一工作台串联任务安排、异常反馈与处理状态，让不同角色看到各自需要的信息。','这里可以进一步展示业务流程、角色权限、关键界面和验收标准。'],notice:'示例项目 · 用于展示作品集结构，并非已交付的真实项目。'}},
  {name:'AI 企业知识助手',stage:'概念探索',summary:'帮助企业员工从分散资料中找到答案，并核对回答依据。',category:'企业效率 / AI 应用',role:'待补充',work:'知识检索 · 来源追溯',result:'待补充',cover:'assets/project-knowledge.svg',detail:{type:'PROJECT / 02 · 示例',title:'AI 企业知识助手',paragraphs:['场景设想：企业资料分散，查找答案需要反复检索和向同事确认。','方案示例：结合知识检索与 AI 问答，呈现答案和相关资料来源，方便用户核对。','这里可以补充知识范围、权限设计、回答质量评测，以及无法回答时的处理方式。'],notice:'示例项目 · 概念内容仅用于预览，暂无真实业务数据或效果结论。'}},
  {name:'AI 个人效率助手',stage:'交互原型',summary:'帮助个人把零散想法整理成任务清单，让下一步行动更清楚。',category:'个人效率 / ToC AI',role:'待补充',work:'任务整理 · 行动建议',result:'待补充',cover:'assets/project-personal.svg',detail:{type:'PROJECT / 03 · 示例',title:'AI 个人效率助手',paragraphs:['场景设想：想法与待办随手记在各处，真正开始行动时难以理清优先级。','方案示例：帮助用户整理零散输入，生成可修改的任务清单与下一步建议。','这里可以展示核心使用路径、交互原型与用户反馈，并说明哪些建议仍需用户确认。'],notice:'示例项目 · 用于演示 ToC 产品的作品呈现方式，并非真实上线产品。'}}
];
let projectIndex = 0;
const projectGallery = document.querySelector('.project-gallery');
const projectMedia = projectGallery.querySelector('.project-media');
function renderProjectImages() {
  const project = projects[projectIndex];
  const images = project.images || [{src:project.cover,alt:project.coverAlt || `${project.name}的示例界面`,width:900,height:414}];
  projectMedia.classList.toggle('project-shots',Boolean(project.images));
  document.querySelector('#project-slide').classList.toggle('compact-project',Boolean(project.images));
  projectMedia.setAttribute('aria-label',`${project.name}界面展示`);
  projectMedia.replaceChildren(...images.map((image,i) => {
    const figure = document.createElement('figure');
    figure.className = project.images ? 'project-shot' : 'project-visual';
    const picture = document.createElement('img');
    picture.src = image.src;
    picture.alt = image.alt;
    picture.width = image.width;
    picture.height = image.height;
    const caption = document.createElement('figcaption');
    caption.textContent = project.images ? `${String(i+1).padStart(2,'0')} · ${image.title}` : project.caption || '界面示意 · 非真实项目截图';
    figure.append(picture,caption);
    return figure;
  }));
}
function showProject(index, announce = true) {
  const direction = index < projectIndex ? -1 : 1;
  projectIndex = (index + projects.length) % projects.length;
  const project = projects[projectIndex];
  projectGallery.querySelectorAll('[data-stack-offset]').forEach(button => {
    const previewIndex = (projectIndex + Number(button.dataset.stackOffset)) % projects.length;
    button.dataset.projectIndex = previewIndex;
    button.querySelector('.deck-number').textContent = String(previewIndex + 1).padStart(2, '0');
    button.querySelector('.deck-name').textContent = projects[previewIndex].name;
    button.setAttribute('aria-label', `将${projects[previewIndex].name}切换到最前面`);
  });
  document.querySelector('#project-name').textContent = project.name;
  document.querySelector('#project-summary').textContent = project.summary;
  document.querySelector('#project-category').textContent = project.category;
  renderProjectImages();
  projectGallery.querySelector('.badge').textContent = project.badge || '示例项目';
  projectGallery.querySelector('.project-bottom > p').textContent = project.footnote || '真实项目资料待补充';
  document.querySelector('#project-current').textContent = String(projectIndex + 1).padStart(2, '0');
  document.querySelector('#project-total').textContent = String(projects.length).padStart(2, '0');
  document.querySelector('#project-slide').setAttribute('aria-label', `第 ${projectIndex + 1} 个项目，共 ${projects.length} 个`);
  const repositoryLink = projectGallery.querySelector('#project-repository');
  const detailButton = projectGallery.querySelector('#project-dialog');
  const hasRepository = Boolean(project.repository);
  repositoryLink.hidden = !hasRepository;
  repositoryLink.style.display = hasRepository ? '' : 'none';
  detailButton.hidden = hasRepository;
  detailButton.style.display = hasRepository ? 'none' : '';
  if (hasRepository) {
    repositoryLink.href = project.repository;
    repositoryLink.setAttribute('aria-label', `查看 ${project.name} 的 GitHub 项目（新标签页）`);
  }
  detailButton.setAttribute('aria-label', `查看${project.name}详情`);
  if (announce && !motionPreference.matches) {
    const panel = document.querySelector('#project-slide');
    const existing = panel.getAnimations();
    const current = getComputedStyle(panel);
    const start = existing.length ? {transform:current.transform, opacity:current.opacity} :
      {transform:`translate3d(${direction * 14}px,12px,0) scale(.99)`, opacity:.65};
    existing.forEach(animation => animation.cancel());
    panel.animate([start,{transform:'translate3d(0,0,0) scale(1)',opacity:1}],{duration:420,easing:surfaceEase});
    projectGallery.querySelectorAll('.deck-preview').forEach((layer, i) => {
      layer.getAnimations().forEach(a => a.cancel());
      layer.animate([{translate:`0 ${i ? 5 : 3}px`},{translate:'0 0'}],{duration:440+i*30,easing:surfaceEase});
    });
  }
  if (announce) document.querySelector('#project-announcement').textContent = `第 ${projectIndex + 1} 个项目，共 ${projects.length} 个：${project.name}`;
}
projectGallery.querySelector('.project-next').addEventListener('click', () => showProject(projectIndex + 1));
projectGallery.querySelector('.project-prev').addEventListener('click', () => showProject(projectIndex - 1));
projectGallery.querySelectorAll('[data-project-index]').forEach(button => {
  button.addEventListener('click', () => showProject(Number(button.dataset.projectIndex)));
});
projectGallery.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    showProject(projectIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
projects.slice(1).forEach(project => { const image = new Image(); image.src = project.cover; });
showProject(0, false);


// Two notes per page; mobile stacks the same pair without changing pagination.
const noteGallery = document.querySelector('.note-gallery');
const noteCards = [...noteGallery.querySelectorAll('.note')];
const notesPerPage = 2;
const notePageCount = Math.max(1, Math.ceil(noteCards.length / notesPerPage));
let notePage = 0;
function showNotePage(page, announce = true) {
  const direction = page < notePage ? -1 : 1;
  const focusedCard = noteCards.find(card => card === document.activeElement);
  notePage = ((page % notePageCount) + notePageCount) % notePageCount;
  const first = notePage * notesPerPage;
  const visibleCards = noteCards.slice(first, first + notesPerPage);
  noteCards.forEach((card, i) => {
    card.getAnimations().forEach(animation => animation.cancel());
    card.hidden = i < first || i >= first + notesPerPage;
  });
  document.querySelector('#note-current').textContent = String(notePage + 1).padStart(2, '0');
  document.querySelector('#note-total').textContent = String(notePageCount).padStart(2, '0');
  noteGallery.querySelectorAll('.note-navigation button').forEach(button => {button.disabled = notePageCount <= 1;});
  if (focusedCard?.hidden) visibleCards[0]?.focus({preventScroll:true});
  if (announce && !motionPreference.matches) {
    visibleCards.forEach(card => card.animate([
      {transform:`translate3d(${direction * 14}px,12px,0) scale(.99)`,opacity:.65},
      {transform:'translate3d(0,0,0) scale(1)',opacity:1}
    ],{duration:420,easing:surfaceEase}));
  }
  if (announce) document.querySelector('#note-announcement').textContent = `第 ${notePage + 1} 页，共 ${notePageCount} 页：${visibleCards.map(card => card.querySelector('h3').textContent).join('、')}`;
}
noteGallery.querySelector('.note-next').addEventListener('click', () => showNotePage(notePage + 1));
noteGallery.querySelector('.note-prev').addEventListener('click', () => showNotePage(notePage - 1));
noteGallery.addEventListener('keydown', event => {
  if (notePageCount <= 1 || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
  event.preventDefault();
  showNotePage(notePage + (event.key === 'ArrowRight' ? 1 : -1));
});
showNotePage(0, false);

// Critically damped, time-based tracking; no autonomous motion or idle RAF loop.
(() => {
  const wallpaper = document.querySelector('.ambient-wallpaper');
  const finePointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
  let frame = 0, lastTime = 0;
  let x = 0, y = 0, vx = 0, vy = 0, targetX = 0, targetY = 0;
  const omega = 18;
  function paint() {
    wallpaper.style.setProperty('--wallpaper-x', `${x.toFixed(3)}px`);
    wallpaper.style.setProperty('--wallpaper-y', `${y.toFixed(3)}px`);
  }
  function tick(time) {
    frame = 0;
    const dt = lastTime ? Math.min((time-lastTime)/1000, .05) : 1/60;
    lastTime = time;
    const decay = Math.exp(-omega * dt);
    const dx = x-targetX, dy = y-targetY;
    const cx = vx+omega*dx, cy = vy+omega*dy;
    x = targetX+(dx+cx*dt)*decay;
    y = targetY+(dy+cy*dt)*decay;
    vx = (vx-omega*cx*dt)*decay;
    vy = (vy-omega*cy*dt)*decay;
    if (Math.abs(x-targetX)+Math.abs(y-targetY)<.025 && Math.abs(vx)+Math.abs(vy)<.08) {
      x=targetX; y=targetY; vx=vy=0; lastTime=0; paint(); return;
    }
    paint(); frame=requestAnimationFrame(tick);
  }
  function start() {if (!frame) {lastTime=0; frame=requestAnimationFrame(tick);}}
  function reset() {
    cancelAnimationFrame(frame); frame=0; lastTime=0;
    x=y=vx=vy=targetX=targetY=0; paint();
  }
  function leave() {targetX=targetY=0; start();}
  function move(event) {
    if (event.pointerType !== 'mouse') return;
    const nx=Math.max(-1, Math.min(1, event.clientX/window.innerWidth*2-1));
    const ny=Math.max(-1, Math.min(1, event.clientY/window.innerHeight*2-1));
    targetX=nx*Math.min(36,window.innerWidth*.035);
    targetY=ny*Math.min(26,window.innerHeight*.035);
    start();
  }
  function render() {
    document.removeEventListener('pointermove', move);
    document.documentElement.removeEventListener('pointerleave', leave);
    if (!document.hidden && !motionPreference.matches && finePointer.matches && !dialog.open) {
      document.addEventListener('pointermove', move, {passive:true});
      document.documentElement.addEventListener('pointerleave', leave);
    } else if (dialog.open && !motionPreference.matches && !document.hidden && finePointer.matches) {
      cancelAnimationFrame(frame); frame=0; lastTime=0;
      targetX=x; targetY=y; vx=vy=0;
    } else reset();
  }
  // A modal freezes decorative motion so attention stays on its contents.
  new MutationObserver(render).observe(dialog,{attributes:true,attributeFilter:['open']});
  window.addEventListener('resize', reset, {passive:true});
  document.addEventListener('visibilitychange', render);
  motionPreference.addEventListener('change', render);
  finePointer.addEventListener('change', render);
  render();
})();

