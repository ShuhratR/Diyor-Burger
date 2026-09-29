import { expect, test } from "@playwright/test";
const oldCart = {version:1, items:[
 {productId:"archived-combo",quantity:1,productName:"Комбо №6"},
 {productId:"hamburger",quantity:2,productName:"Гамбургер"},
 {productId:"pepperoni",variantId:"archived-size",quantity:1,
   productName:"Пицца Пепперони",variantName:"36 см"}
]};
test.beforeEach(async ({page})=>{
 await page.addInitScript(data=>localStorage.setItem("diyor-cart",JSON.stringify(data)),oldCart);
});
test("mobile checkout identifies specific archived items and only removes them",async ({page})=>{
 await page.goto("/checkout");
 const dialog=page.getByRole("dialog",{name:"Некоторые блюда больше недоступны"});
 await expect(dialog).toBeVisible();
 await expect(dialog).toContainText("Комбо №6");
 await expect(dialog).toContainText("Пицца Пепперони · 36 см");
 await dialog.getByRole("button",{name:"Удалить Комбо №6"}).click();
 await expect(dialog).not.toContainText("Комбо №6");
 await dialog.getByRole("button",{name:"Удалить все недоступные"}).click();
 await expect(dialog).toHaveCount(0);
 await expect(page.getByRole("button",{name:"Оформить и открыть WhatsApp"})).toBeEnabled();
 await expect.poll(async ()=>page.evaluate(()=>
   JSON.parse(localStorage.getItem("diyor-cart")||"{}").items)).toEqual([
   {productId:"hamburger",quantity:2,productName:"Гамбургер"}
 ]);
});
test("buyer input survives removal of stale cart lines",async ({page})=>{
 await page.goto("/checkout");
 await page.getByRole("button",{name:"Закрыть предупреждение"}).click();
 await page.getByLabel("Имя",{exact:true}).fill("Суҳроб");
 await page.getByLabel("Телефон",{exact:true}).fill("901234567");
 await page.getByRole("button",{name:"Посмотреть и удалить"}).click();
 await page.getByRole("dialog").getByRole("button",{name:"Удалить все недоступные"}).click();
 await expect(page.getByLabel("Имя",{exact:true})).toHaveValue("Суҳроб");
 await expect(page.getByLabel("Телефон",{exact:true})).toHaveValue("901234567");
});
test("server refuses entire invalid cart without issuing a WhatsApp link",async ({request})=>{
 const response=await request.post("/api/checkout/prepare",{
  data:{items:oldCart.items,name:"Тест",phone:"901234567",fulfillment:"pickup"}
 });
 expect(response.status()).toBe(400);
 const result=await response.json();
 expect(result.ok).toBe(false);
 expect(result.unavailableItems).toHaveLength(2);
 expect(result.unavailableItems.map((item:{productId:string})=>item.productId))
   .toEqual(["archived-combo","pepperoni"]);
 expect(result.summary).toBeUndefined();
});
