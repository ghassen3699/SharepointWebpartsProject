import { SEND_PURCHASE_PRODUCTS } from "../API_END_POINTS/AchatModuleEndPoints";


// GET all sub product family 
export async function sendPerchaseRequest(MatDemandeur, NameDemandeur, RespCenter, BeneficiaryCenter, IdFamily, PurchaseRequestLines, fileName, file) {
    try {
        const response = await fetch(SEND_PURCHASE_PRODUCTS, {
            method: 'POST',
            headers: new Headers({ 'Authorization': `Basic ${btoa(`Achat_Mod_24:Achat$$Mod*%24`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
            body:  JSON.stringify({
                "MatDemandeur": MatDemandeur,
                "NameDemandeur": NameDemandeur,
                "RespCenter": RespCenter,
                "BeneficiaryCenter": BeneficiaryCenter,
                "IdFamily": IdFamily,
                "PurchaseRequestLines": PurchaseRequestLines,
                "fileName": fileName,
                "file": file
            })
        });
        const data = await response.json();
        return data
    } catch (error) {
        console.log(error);
    }
}
