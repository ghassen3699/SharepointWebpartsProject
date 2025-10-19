import { GetProjectCapex } from "../API_END_POINTS/AchatModuleEndPoints";


export async function getProjectCapex(axe, respCenter, budgetName) {
    try {
        const response = await fetch(GetProjectCapex, {
            method: 'POST',
            headers: new Headers({ "Authorization": `Basic ${btoa(`Achat_Mod_24:Achat$$Mod*%24`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
            body: JSON.stringify({ "Axe": axe, "RespCenter": respCenter, "BudgetName": budgetName })
        });
        const data = await response.json();
        return data
    } catch (error) {
        console.log(error);
    }
}
