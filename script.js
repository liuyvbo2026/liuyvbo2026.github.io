const content = {


  letter: {type:'微信公众号 / 示例文章',title:'给这个小站的第一封信',paragraphs:['先留一个位置。','这个小站暂时还没有很多内容。想做的事、随手记下的片段、做了一半的小实验，都可以从这里慢慢开始。','等过一段时间再回来看，希望能看见一些变化。也许是一篇写完的记录，也许是一个终于做出来的小东西。','第一步，就是让它有一个开始。'],notice:'这是一篇示例短文，之后可替换为你的第一篇记录。'},
  curiosity: {type:'人人都是产品经理 / 示例文章',title:'最近在关注什么',paragraphs:['有些问题还没有答案，但值得先记下来。','最近读到的一段话，用过的一个工具，或日常生活中一个小小的不方便，都可能成为下一次探索的起点。','这里可以用来收集这些片段。不必每次都写成长文章，几句话也很好。'],notice:'这是一篇示例短文，之后可替换为你的真实记录。'},
};
const dialog = document.querySelector('#detail');
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
  });
});
document.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
const navLinks=[...document.querySelectorAll('nav a')];
const sections=[...document.querySelectorAll('main>section')];
let scheduled=false;
function updateNav(){const anchor=window.innerHeight*.35;let current=sections[0].id;sections.forEach(section=>{if(section.getBoundingClientRect().top<=anchor)current=section.id;});if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-4)current='contact';navLinks.forEach(link=>{if(link.hash==='#'+current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});scheduled=false;}
window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateNav);}},{passive:true});
updateNav();

const copyWechat = document.querySelector('.copy-wechat');
const contactStatus = document.querySelector('.contact-status');
let copyReset;
copyWechat.addEventListener('click', async () => {
  const value = document.querySelector('#wechat-id').textContent.trim();
  clearTimeout(copyReset);
  try {
    await navigator.clipboard.writeText(value);
    copyWechat.querySelector('.copy-label').textContent = '已复制';
    contactStatus.textContent = '微信号已复制，打开微信搜索即可添加。';
    copyReset = setTimeout(() => {
      copyWechat.querySelector('.copy-label').textContent = '复制';
      contactStatus.textContent = '';
    }, 4000);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('#wechat-id'));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyWechat.querySelector('.copy-label').textContent = '复制';
    contactStatus.textContent = '微信号已选中，请长按或使用系统复制快捷键。';
  }
});

const projects = [
  {name:'智能制造协同平台',stage:'示例方案',summary:'为生产团队集中管理任务与现场异常，让处理进度更容易追踪。',category:'智能制造 / 业务协同',role:'待补充',work:'流程梳理 · 任务协同',result:'待补充',cover:'project-manufacturing.svg',detail:{type:'PROJECT / 01 · 示例',title:'智能制造协同平台',paragraphs:['场景设想：生产任务与现场异常分散在多个沟通渠道，进度难以追踪。','方案示例：通过统一工作台串联任务安排、异常反馈与处理状态，让不同角色看到各自需要的信息。','这里可以进一步展示业务流程、角色权限、关键界面和验收标准。'],notice:'示例项目 · 用于展示作品集结构，并非已交付的真实项目。'}},
  {name:'AI 企业知识助手',stage:'概念探索',summary:'帮助企业员工从分散资料中找到答案，并核对回答依据。',category:'企业效率 / AI 应用',role:'待补充',work:'知识检索 · 来源追溯',result:'待补充',cover:'project-knowledge.svg',detail:{type:'PROJECT / 02 · 示例',title:'AI 企业知识助手',paragraphs:['场景设想：企业资料分散，查找答案需要反复检索和向同事确认。','方案示例：结合知识检索与 AI 问答，呈现答案和相关资料来源，方便用户核对。','这里可以补充知识范围、权限设计、回答质量评测，以及无法回答时的处理方式。'],notice:'示例项目 · 概念内容仅用于预览，暂无真实业务数据或效果结论。'}},
  {name:'AI 个人效率助手',stage:'交互原型',summary:'帮助个人把零散想法整理成任务清单，让下一步行动更清楚。',category:'个人效率 / ToC AI',role:'待补充',work:'任务整理 · 行动建议',result:'待补充',cover:'project-personal.svg',detail:{type:'PROJECT / 03 · 示例',title:'AI 个人效率助手',paragraphs:['场景设想：想法与待办随手记在各处，真正开始行动时难以理清优先级。','方案示例：帮助用户整理零散输入，生成可修改的任务清单与下一步建议。','这里可以展示核心使用路径、交互原型与用户反馈，并说明哪些建议仍需用户确认。'],notice:'示例项目 · 用于演示 ToC 产品的作品呈现方式，并非真实上线产品。'}}
];
let projectIndex = 0;
const projectGallery = document.querySelector('.project-gallery');
function showProject(index, announce = true) {
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
  document.querySelector('#project-role').textContent = project.role;
  document.querySelector('#project-work').textContent = project.work;
  document.querySelector('#project-result').textContent = project.result;
  const cover = document.querySelector('#project-cover');
  cover.src = project.cover;
  cover.alt = `${project.name}的示例界面`;
  document.querySelector('#project-current').textContent = String(projectIndex + 1).padStart(2, '0');
  document.querySelector('#project-total').textContent = String(projects.length).padStart(2, '0');
  document.querySelector('#project-slide').setAttribute('aria-label', `第 ${projectIndex + 1} 个项目，共 ${projects.length} 个`);
  projectGallery.querySelector('.project-details').setAttribute('aria-label', `查看${project.name}详情`);
  if (announce && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const panel = document.querySelector('#project-slide');
    panel.getAnimations().forEach(animation => animation.cancel());
    panel.animate([{transform:'translateY(10px)',opacity:.6},{transform:'translateY(0)',opacity:1}],{duration:260,easing:'cubic-bezier(.2,.7,.3,1)'});
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


// Always-on grey wallpaper with event-driven mouse parallax.
(() => {
  const wallpaper = document.querySelector('.ambient-wallpaper');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
  let frame = 0;
  let x = 0;
  let y = 0;
  function paint() {
    wallpaper.style.setProperty('--wallpaper-x', `${x.toFixed(2)}px`);
    wallpaper.style.setProperty('--wallpaper-y', `${y.toFixed(2)}px`);
    frame = 0;
  }
  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    x = y = 0;
    paint();
  }
  function move(event) {
    if (event.pointerType !== 'mouse') return;
    const nx = Math.max(-1, Math.min(1, event.clientX / window.innerWidth * 2 - 1));
    const ny = Math.max(-1, Math.min(1, event.clientY / window.innerHeight * 2 - 1));
    x = nx * Math.min(36, window.innerWidth * .035);
    y = ny * Math.min(26, window.innerHeight * .035);
    if (!frame) frame = requestAnimationFrame(paint);
  }
  function render() {
    document.removeEventListener('pointermove', move);
    document.documentElement.removeEventListener('pointerleave', reset);
    if (!document.hidden && !reducedMotion.matches && finePointer.matches) {
      document.addEventListener('pointermove', move, {passive:true});
      document.documentElement.addEventListener('pointerleave', reset);
    } else {
      reset();
    }
  }
  window.addEventListener('resize', reset, {passive:true});
  document.addEventListener('visibilitychange', render);
  reducedMotion.addEventListener('change', render);
  finePointer.addEventListener('change', render);
  render();
})();
