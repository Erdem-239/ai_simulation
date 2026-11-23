# Sırada ne var? Araştırma ve ders konuları

Üzerinde çalıştığım ve yazmak istediğim konuların listesi bu. Hepsi aynı aşamada değil: bir kısmının dersi sitede zaten hazır (🟢), bir kısmı için henüz kaynak okuyorum, bir kısmını ise ilk kez araştıracağım. Bir konu **yayına hazır olmadan yazılmaz**; araştırmam bittiğinde bu listede durumu güncellenir.

**Durumlar:** ✅ LinkedIn'de yayınlandı · 🟢 sitede ders/malzeme hazır · 🟡 kısmen hazır ya da okunuyor · ⚪ araştırılacak

## ✅ LinkedIn'de yayınladıklarım

Bunlar yazıldı ve paylaşıldı; her birinin sitede canlı simülasyonu var:

- **7+5= yazınca ne olur?** Bir dil modelinin sıradaki karakteri nasıl seçtiği. [GPT Test dersi](../yapay-zeka/index.html#ders=gpt) · [Minik GPT adım adım](../yapay-zeka/harita/adim-adim.html)
- **XOR:** tek nöron neden çözemez, gizli katman ne yapar. [XOR dersi](../yapay-zeka/index.html#ders=xor)
- **Weight-Space Programming:** ağırlığı eğitmeden düzenlemek; iddia ve iki bağımsız sınama. [İnce Ayar dersi](../yapay-zeka/index.html#ders=ft) (Ekstra bölümü)
- **Site ve yol haritası tanıtımı:** bu sitenin yapısı. [Yol Haritası](../yapay-zeka/index.html)

## Dizi dizi

- **Sıra modelleme:** RNN → LSTM → Q/K/V
- **Düşünme:** reasoning → looping transformer → enerji tabanlı akıl yürütme
- **Bilgi:** bilgi nedir → veri nerede saklanır → pretraining ve perplexity
- **Ajanlar:** harness → always-on agent → kendini kopyalama riski
- **Donanım ve sınırlar:** yerel çalıştırma → uzayda model → ucuz çıkarım

## Tüm konular

1. 🟢 **RNN:** zamanda açılmış hücre, BPTT, vanishing/exploding gradyan.
2. 🟢 **LSTM:** kapılar, hücre durumu, "gradyan otobanı".
3. 🟢 **Q/K/V:** sorgu, anahtar, değer ve dikkat; neden ayrı üç tablo?
4. ⚪ **Energy-Based Reasoners:** tekrarlayan bir akıl yürütücüyü enerji tabanlı model olarak kurmak.
5. ⚪ **Bilgi nedir, model bilgiyi nasıl öğrenir?** Veriden ağırlığa sıkıştırma; ezber ve genelleme farkı.
6. 🟡 **Verinin depolanması:** ağırlıkta mı, dışarıda mı (RAG, vektör deposu, bağlam)?
7. ⚪ **Inkling 2 mini:** model ve mimari gelişmeleri.
8. ⚪ **Always-on agent:** sürekli çalışan ajan; bellek, tetikleyici, maliyet, güvenlik.
9. 🟡 **Looping transformer:** aynı katmanları tekrar çalıştırarak "düşünmek".
10. 🟡 **Pretraining ve perplexity:** perplexity neyi ölçer, neyi ölçmez?
11. 🟢 **Harness:** ajanı saran döngü, araçlar, bağlam yönetimi.
12. ⚪ **Reasoning:** chain-of-thought, test-time compute, pekiştirmeli öğrenmeyle akıl yürütme eğitimi.
13. 🟡 **Modeller uydularda çalışabilir mi?** Uzayda çıkarım; radyasyon ve ısı sınırları, yörüngede GPU denemeleri.
14. 🟡 **Yapay zekâ kendini kopyalayabilir mi?** Laboratuvarda ölçülen yetenek ile gerçek dünyadaki risk arasındaki fark.
15. 🟢 **Dikkatte konum:** RoPE, mutlak konum ve mesafe.
16. 🟡 **GQA, MoE ve ucuz çıkarım:** az çalışıp çok bilgi saklayan modeller.
17. 🟢 **Tokenizasyon:** BPE ve Türkçenin token maliyeti.
18. 🟢 **Ön eğitimden sohbet modeline:** ince ayar, RLHF, DPO.
19. ✅ **Eğitmeden model düzenleme:** ağırlık uzayında nöron düzenleme; alan çok yeni.
20. 🟢 **Değerlendirme:** benchmark'a güvenme, sızıntı, güven aralığı.
21. 🟢 **Üretim stratejileri:** sıcaklık, top-p, beam search.
22. 🟢 **Diffusion ve yönlendirme:** gürültüden resme, metinden görüntüye.
23. 🟡 **Kapalı modeller hakkında ne biliyoruz, ne bilmiyoruz?** Mimarisi yayımlanmayanlar için dürüst bir harita.
24. 🟢 **Yerel model çalıştırma:** donanım ve bellek hesabı rehberi.
25. 🟢 **Optimizer ve aşırı öğrenme:** Adam'ın her zaman daha iyi olmadığı küçük bir deney.

## Nasıl çalışıyorum?

Her konu için önce kaynakları okuyorum, sayıların hangisinin ölçüldüğünü hangisinin yalnızca haberlerde geçtiğini ayırıyorum, sonra yazıyorum. Emin olmadığım bir şeyi emin gibi yazmamaya çalışıyorum; bunu yazılarda açıkça belirteceğim.

Hangisini önce görmek istersin? Yaz, sıralamayı ona göre değiştireyim.
