import { SEND_PURCHASE_PRODUCTS } from "../API_END_POINTS/AchatModuleEndPoints";


// POST purshase request data to ERP
export async function sendPerchaseRequest(MatDemandeur, NameDemandeur, RespCenter, IdFamily, Approbateur1, Approbateur2, Approbateur3, Approbateur4, IDRequestIntranet, CreatedDateIntranet, BudgetName, PurchaseRequestLines, fileName, file) {
    console.log(file)
    try {
        const response = await fetch(SEND_PURCHASE_PRODUCTS, {
            method: 'POST',
            headers: new Headers({ 'Authorization': `Basic ${btoa(`Achat_Mod_24:Achat$$Mod*%24`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
            body: JSON.stringify({
                "MatDemandeur": MatDemandeur,
                "NameDemandeur": NameDemandeur,
                "RespCenter": RespCenter,
                "IdFamily": IdFamily,
                "Approbateur1": Approbateur1,
                "Approbateur2": Approbateur2,
                "Approbateur3": Approbateur3,
                "Approbateur4": Approbateur4,
                "IDRequestIntranet": IDRequestIntranet,
                "CreatedDateIntranet": CreatedDateIntranet,
                "BudgetName": BudgetName,
                "PurchaseRequestLines": PurchaseRequestLines,
                "fileName": fileName,
                "file": file
            })
        });
        console.log(response)
        const data = await response.json();

        console.log(data)
        return data

    } catch (error) {
        console.log(error);
    }
}
