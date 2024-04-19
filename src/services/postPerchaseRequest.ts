import { SEND_PURCHASE_PRODUCTS } from "../API_END_POINTS/AchatModuleEndPoints";


// GET all sub product family 
export async function sendPerchaseRequest(MatDemandeur, NameDemandeur, RespCenter, BeneficiaryCenter, IdFamily, PurchaseRequestLines, fileName, file) {
    try {

        console.log(MatDemandeur, NameDemandeur, RespCenter, BeneficiaryCenter, IdFamily, PurchaseRequestLines)
        const response = await fetch(SEND_PURCHASE_PRODUCTS, {
            method: 'POST',
            headers: new Headers({ 'Authorization': `Basic ${btoa(`Achat_Mod_24:Achat$$Mod*%24`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
            // body:  JSON.stringify({
            //     "MatDemandeur": "1003",
            //     "NameDemandeur": "Dev Alight",
            //     "RespCenter": "HEALTH",
            //     "BeneficiaryCenter": "COM",
            //     "IdFamily": "01",
            //     "PurchaseRequestLines": [
            //       {
            //         "RefItem": "010010001",
            //         "ItemDescription": "test 1",
            //         "Quantity": "1",
            //         "EstimatePrice": "1",
            //         "DesiredDeliveryTime": 1
            //       },
            //          {
            //         "RefItem": "010010002",
            //         "ItemDescription": "test 2",
            //         "Quantity": "2",
            //         "EstimatePrice": "2",
            //         "DesiredDeliveryTime": 2
            //       }
            //     ],
            //     fileName: "",
            //     file: ""
            // })
            body:  JSON.stringify({
              "MatDemandeur": MatDemandeur,
              "NameDemandeur": NameDemandeur,
              "RespCenter": RespCenter,
              "BeneficiaryCenter": BeneficiaryCenter,
              "IdFamily": IdFamily,
              "PurchaseRequestLines": PurchaseRequestLines,
              fileName: "",
              file: ""
          })
        });
        const data = await response.json();

        console.log(data)
        return data

    } catch (error) {
        console.log(error);
    }
}
