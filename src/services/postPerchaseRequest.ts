import { SEND_PURCHASE_PRODUCTS } from "../API_END_POINTS/AchatModuleEndPoints";


// GET all sub product family 
export async function sendPerchaseRequest(MatDemandeur, NameDemandeur, RespCenter, IdFamily, PurchaseRequestLines, fileName, file) {
    console.log(file)
    try {
        console.log(MatDemandeur, NameDemandeur, RespCenter, IdFamily, PurchaseRequestLines)
        const response = await fetch(SEND_PURCHASE_PRODUCTS, {
            method: 'POST',
            headers: new Headers({ 'Authorization': `Basic ${btoa(`Achat_Mod_24:Achat$$Mod*%24`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
            body:  JSON.stringify({
              "MatDemandeur": MatDemandeur,
              "NameDemandeur": NameDemandeur,
              "RespCenter": RespCenter,
              "IdFamily": IdFamily,
              "PurchaseRequestLines": PurchaseRequestLines,
              "fileName": fileName,
              "file": "W29iamVjdCBPYmplY3Rd"
          })
        });
        const data = await response.json();

        console.log(data)
        return data

    } catch (error) {
        console.log(error);
    }
}
