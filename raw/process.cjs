const sharp=require('sharp');const fs=require('fs');
const out='public/assets/img/';
async function trimSave(input,name,max){ // trim transparent, resize, webp
  const b=await sharp(input).trim({threshold:8}).toBuffer();
  const img=sharp(b).resize(max,max,{fit:'inside',withoutEnlargement:true});
  const info=await img.webp({quality:86,alphaQuality:90}).toFile(out+name+'.webp');
  return {w:info.width,h:info.height};
}
(async()=>{
  const meta={};
  for(const [f,max] of [['witch',1400],['cart',1400],['gate',1500],['banyan',1500],['altar',1200],['teatable',1200],['pond',1200]]) meta[f]=await trimSave('raw/'+f+'.png',f,max);
  async function grid(f,cols,rows,prefix,max){
    const m=await sharp('raw/'+f+'.png').metadata();const cw=Math.floor(m.width/cols),ch=Math.floor(m.height/rows);
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const cell=await sharp('raw/'+f+'.png').extract({left:c*cw,top:r*ch,width:cw,height:ch}).toBuffer();
      const n=prefix+(r*cols+c);
      meta[n]=await trimSave(cell,n,max);
    }
  }
  await grid('flowers',4,4,'flower',720);
  await grid('plants',3,3,'plant',1100);
  if (fs.existsSync('raw/fx.png')) await grid('fx',3,3,'fx',1000);
  // butterflies: keep cell centered (don't trim asymmetrically): trim then pad to symmetric
  {const m=await sharp('raw/butterflies.png').metadata();const cw=Math.floor(m.width/3),ch=Math.floor(m.height/2);
   for(let i=0;i<6;i++){const cell=await sharp('raw/butterflies.png').extract({left:(i%3)*cw,top:Math.floor(i/3)*ch,width:cw,height:ch}).toBuffer();
     const info=await sharp(await sharp(cell).trim({threshold:8}).toBuffer()).resize(320,320,{fit:'inside'}).webp({quality:88}).toFile(out+'bfly'+i+'.webp');meta['bfly'+i]={w:info.width,h:info.height};}}
  // sky: make seamless by mirroring -> 2x width
  await sharp('raw/sky.png').resize(4096,null).webp({quality:90}).toFile(out+'sky.webp');
  await sharp('raw/ground.png').resize(1536,1536).webp({quality:84}).toFile(out+'ground.webp');
  const old=JSON.parse(fs.readFileSync('src/sprites.json'));for(const k of ['ped0','ped1','ped2'])meta[k]=old[k];
  fs.writeFileSync('src/sprites.json',JSON.stringify(meta));
  console.log(meta);
})();
