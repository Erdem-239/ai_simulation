// Gökyüzündeki saklı nesneleri şifreler. Kullanım:
//   node tools/sky-encrypt.js /yol/sky-secrets.json  > js/sky-data.js
// sky-secrets.json REPODA TUTULMAZ. Biçim:
//   [{ "key":"14|07|53|+23|41", "fx":0.1, "fy":0.55,
//      "info":{"name":"…","tip":"…","col":"r,g,b","txt":"…","href":"…","cta":"…"} }, …]
// key = saat|dakika|saniye|±derece|yay-dakikası (sitedeki koordinat kutusu aynı biçime çevirir).
const c=require('crypto'),fs=require('fs');
const list=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const out=list.map(o=>{
  const salt=c.randomBytes(16),iv=c.randomBytes(12),k=c.pbkdf2Sync(o.key,salt,150000,32,'sha256');
  const ci=c.createCipheriv('aes-256-gcm',k,iv),ct=Buffer.concat([ci.update(JSON.stringify(o.info),'utf8'),ci.final(),ci.getAuthTag()]);
  return {fx:o.fx,fy:o.fy,s:salt.toString('base64'),iv:iv.toString('base64'),c:ct.toString('base64')};
});
console.log('/* Otomatik üretildi (tools/sky-encrypt.js). İçerik şifreli; koordinatı bilmeden okunamaz. */\nwindow.SKY_DATA='+JSON.stringify(out)+';');
