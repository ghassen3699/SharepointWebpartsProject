import * as React from 'react';
import stylescustom from './ModifierDemande.module.scss';
import { IModifierDemandeProps } from './IModifierDemandeProps';
import { Dropdown, IDropdownOption, IDropdownProps, IDropdownStyles } from 'office-ui-fabric-react/lib/Dropdown';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { IDatePickerStrings } from 'office-ui-fabric-react/lib/DatePicker';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import SweetAlert2 from 'react-sweetalert2';
var img = require('../../../image/UCT_image.png');
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/attachments";
import "@pnp/sp/site-users/web";
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import {
  Fabric,
  loadTheme
} from "office-ui-fabric-react";
import { getTheme } from "@uifabric/styling";
import { Web } from '@pnp/sp/webs';
import { IItemAddResult } from '@pnp/sp/items';
import GraphService from '../../../services/GraphServices';
import { checkIfAxeExists, getApprobateurNiveau, getCurrentDate } from '../../../tools/FunctionTools';
import { getUserInfo } from "../../../services/getUserInfo" ;
import { getSubFamily } from "../../../services/getProductsSubFamily" ;
import { getFamily } from "../../../services/getAllProductFamily" ;
import { getProduct } from "../../../services/getProducts" ;
import { getApprouverList } from "../../../services/getApprouveurs" ;
import { getBenefList } from "../../../services/getListBenefPermissions" ;

loadTheme({
  palette: {
  },
  semanticColors: {
    bodyBackground: "white",
    inputBackground: "white",
    disabledBackground: "#7D2935",
    disabledText: "white"
  }
});
const theme = getTheme();


export const DatePickerStrings: IDatePickerStrings = {
  months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  shortMonths: ['Jan', 'Feb', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'],
  days: ['Diamanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  shortDays: ['DI', 'LU', 'MA', 'ME', 'JE', 'VE', 'SA'],
  goToToday: "Aller à aujourd'hui",
  prevMonthAriaLabel: 'Aller au mois précédent',
  nextMonthAriaLabel: 'Aller au mois prochain',
  prevYearAriaLabel: "Aller à l'année précédente",
  nextYearAriaLabel: "Aller à l'année prochaine",
  invalidInputErrorMessage: 'Invalid date format.'
};


export const FormatDate = (date: any): string => {
  var date1 = new Date(date);
  var year = date1.getFullYear();
  var month = (1 + date1.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  var day = date1.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  return day + '/' + month + '/' + year;
};



export const FormatDateERP = (date: any): string => {
  var date1 = new Date(date);
  var year = date1.getFullYear();
  var month = (1 + date1.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  var day = date1.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  return year + '-' + month + '-' + day;
};

export default class ModifierDemande extends React.Component<IModifierDemandeProps, {}> {

  // State variables of webpart 
  public state = {

    formData : [{
      FamilleSelected: [] as any,
      SousFamilleSelected : [] as any,
      ArticleSelected: [] as any,
      BeneficiareSelected : [] as any,
      Comment: "",
      quantity: "1",
      price: "" ,
      DateSouhaite: new Date() ,
      numberOfDays: 0,
      fileData: "" as any,
      fileName: "",
    }],

    familyProducts: [],
    subFamilyProducts: [],
    articles: [],
    // axePerBuget: [{Axe: "", BudgetAnnualAllocated: "", BudgetAnnualRemaining: "", BudgetAnnualUsed: ""}],
    axePerBuget: [],
    CentreDeGestion: "",


    FamilleID : "",
    SousFamilleID : "" ,
    ArticleID : "" ,

    ID: 0,
    userUPN: "",
    userId: "",
    userRegistrationNumber:"",
    userEstablishment:"",
    userName: "",
    userEmail: "",
    JobTitle: "",

    file: "" as null,
    loadingFile: false,
    fileName: "",
    MontantAlloue: 0 ,
    MontantConsommer: 0 ,
    MontantRestant: 0 ,
    counterProducts: 1 ,
    showValidationPopUp:false,
    DisabledBenef: true,
    errors: { file: "" }
  };  
  private _graphService = new GraphService(this.props.context);

  // private dropdownOptionsListFamille: { key: string, text: string, data: any }[] = [];
  // private dropdownOptionsListSousFamille: { key: string, text: string, data: any }[] = [];
  // private dropdownOptionsRefArticles: { key: string, text: string, data: any }[] = [];
  // private dropdownOptionsBeneficiaire: { key: string, text: string, data: any }[] = [];



  private getUserApprouvers = async(IdSubFamily, respCenter) => {
    const approuverList = await getApprouverList(IdSubFamily, respCenter)
    return approuverList
  }


  private loadUserInfo() {
    console.log(this.props.context.pageContext.legacyPageContext["userPrincipalName"])
    this._graphService.getUserId(this.props.context.pageContext.legacyPageContext["userPrincipalName"])
      .then(user => {
        console.log(user)
        this.setState({
          userName:user["displayName"],
          userEmail:user["mail"],
          userRegistrationNumber:user["employeeId"],
          userEstablishment:user["companyName"],
          JobTitle:user["jobTitle"],
        })
      });
  }

  public initDisableCommentsWrapper() {
    let CommentsWrapper = document.getElementById('CommentsWrapper');
    CommentsWrapper.innerHTML = "";
  }
  

  private onRenderOption(option: IDropdownOption): JSX.Element {
    return (
      <div>
        {option.data && option.data.icon && (
          <Icon style={{ marginRight: '8px', color: option.data.colorName }} iconName={option.data.icon} aria-hidden="true" title={option.data.icon} />
        )}
        <span>{option.text}</span>
      </div>
    );
  }


  private onRenderCaretDown(props: IDropdownProps): JSX.Element {
    return <Icon iconName="CirclePlus" />;
  }


  private onSelectionChanged(ev: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void { }


  public initImage(index: any) {
    const updatedFormData = [...this.state.formData];
    updatedFormData[this.state.counterProducts - 1].fileName = "";
    updatedFormData[this.state.counterProducts - 1].fileData = "";
    this.setState({
      formData: updatedFormData
    });
    (document.getElementById('uploadFile') as HTMLInputElement).value = "";
  }

  private handleChangeQuantity = (event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].quantity = event.target.value
    this.setState({
      formData: updatedFormData
    });
  }


  public addFile = (content: any) => {
    console.log(this.state.counterProducts);
  
    const fileName = content.target.files[0].name;
    const extension = fileName.split('.').pop();
    const encodedFileName = `${fileName.split('.').slice(0, -1).join('.')}_${Date.now()}.${extension}`;
  
    const newFile = new File([content.target.files[0]], encodedFileName, { type: content.target.files[0].type });
  
    const updatedFormData = [...this.state.formData];
    updatedFormData[this.state.counterProducts - 1].fileName = fileName; // Store the original file name
    updatedFormData[this.state.counterProducts - 1].fileData = newFile;
  
    this.setState({
      formData: updatedFormData
    });
  };



  private onRenderTitle(options: IDropdownOption[]): JSX.Element {
    const option = options[0];

    return (
      <div>
        {option.data && option.data.icon && (
          <Icon style={{ marginRight: '8px', color: option.data.colorName }} iconName={option.data.icon} aria-hidden="true" title={option.data.icon} />
        )}
        <span>{option.text} </span>
      </div>
    );
  }


  private handleChangePrice = (event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].price = event.target.value
    this.setState({
      formData: updatedFormData
    });
  }


  private handleChangeComment = (event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].Comment = event.target.value
    this.setState({
      formData: updatedFormData
    });
  }


  private handleChangeFamilleDropdown = async (event:any, index:any) => {
    console.log(event)
    const updatedFormData = [...this.state.formData];
    console.log(updatedFormData)
    updatedFormData[index-1].FamilleSelected = [event] ;
    updatedFormData[index-1].ArticleSelected = [] ;

    this.setState({
      formData: updatedFormData,
      FamilleID: event.key,
      SousFamilleID: "",
      ArticleID: "",
      articles: [],
      // axePerBuget: []
      // updatedFormData[index - 1]["ArticleSelected"][0].key : ""
    });
    await this.getSubFamilyData(event.key)
  }


  private handleChangeSousFamilleDropdown = async(event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].SousFamilleSelected = [event]
    updatedFormData[index-1].ArticleSelected = [] ;

    console.log(index)
    this.setState({
      formData: updatedFormData,
      SousFamilleID: event.key,
      ArticleID: "",
      articles: [],
      // axePerBuget: this.state.axePerBuget.slice(index, 1)
    });

    // const items = await getProduct(event.key, this.state.userEstablishment) ;
    const items = await getProduct("01001", "HEALTH") ;
    const listArticles = items.Items.map(item => ({
      key: item.RefItem, 
      LatestPurchasePrice: item.LatestPurchasePrice,
      text: item.DesignationItem, 
      BudgetAnnualUsed: item.BudgetAnnualUsed,
      BudgetAnnualRemaining: item.BudgetAnnualRemaining, 
      BudgetAnnualAllocated: item.BudgetAnnualAllocated, 
      Axe: item.Axe,  
    }));
    this.setState({articles:listArticles})
  }



  private handleChangeArticleDropdown = (event: any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index - 1].ArticleSelected = [event];
  
    // if (this.state.axePerBuget.some(obj => obj.Axe === x))
    var newAxeList = []
    updatedFormData.forEach(article => {
      if (!this.state.axePerBuget.some(obj => obj.Axe === article.ArticleSelected[0].Axe)) {
        newAxeList.push({
          "Axe": article.ArticleSelected[0].Axe,
          "BudgetAnnualAllocated": article.ArticleSelected[0].BudgetAnnualAllocated,
          "BudgetAnnualRemaining": article.ArticleSelected[0].BudgetAnnualRemaining,
          "BudgetAnnualUsed": article.ArticleSelected[0].BudgetAnnualUsed,
        });
      }else {
        newAxeList = this.state.axePerBuget
      }
    });
  
    this.setState({
      formData: updatedFormData,
      axePerBuget: newAxeList
    });

    

    // if (this.state.axePerBuget.length === 0 ){
    //   const listAxes = [{
    //     Axe: event.Axe,
    //     BudgetAnnualAllocated: event.BudgetAnnualAllocated,
    //     BudgetAnnualRemaining: event.BudgetAnnualRemaining,
    //     BudgetAnnualUsed: event.BudgetAnnualUsed
    //   }]
    //   this.setState({
    //     axePerBuget:listAxes,
    //   })
    // }else {
    //   console.log(index)

    //   if (checkIfAxeExists(this.state.axePerBuget,event.Axe) === false) {
    //     const newAxeObject = {
    //       Axe: event.Axe,
    //       BudgetAnnualAllocated: event.BudgetAnnualAllocated,
    //       BudgetAnnualRemaining: event.BudgetAnnualRemaining,
    //       BudgetAnnualUsed: event.BudgetAnnualUsed
    //     }
    //     // console.log('axe',this.state.axePerBuget)
    //     const updatedAxePerBudget = [...this.state.axePerBuget]
    //     updatedAxePerBudget.push(newAxeObject)
    //     this.setState({
    //       axePerBuget: updatedAxePerBudget
    //     })
    //   }
    // }
  }


  private handleChangeDestinataireDropdown = (event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].BeneficiareSelected = [event]
    this.setState({
      formData: updatedFormData
    });
  }



  private intToList(number: number): number[] {
    const result: number[] = [];
    for (let i = 1; i <= number; i++) {
      result.push(i);
    }
    return result;
  }



  private addArticle = () => {
    const nullObject = {
      FamilleSelected: [] as any,
      SousFamilleSelected: []as any,
      ArticleSelected: []as any,
      BeneficiareSelected: []as any,
      Comment: "",
      quantity:"1",
      price:"",
      numberOfDays: 0,
      DateSouhaite: new Date(),
      fileData: "" as null,
      fileName: "",
    };

    const updatedFormData = [...this.state.formData];

    updatedFormData.push(nullObject);

    this.setState({
      formData: updatedFormData,
      counterProducts: this.state.counterProducts + 1,
    })
  }


  private disabledSubmitButton = () => {
    return this.state.formData.some(formData => (
      formData.FamilleSelected.length === 0 ||
      formData.SousFamilleSelected.length === 0 ||
      formData.ArticleSelected.length === 0 ||
      formData.quantity.length === 0 ||
      formData.price.length === 0 ||
      formData.Comment.length === 0 || 
      formData.numberOfDays === 0
    ));
  }



  // Function to read file info
  public readFile = (fileContent: any) => {
    return new Promise((resolve, reject) => {
      const blob = new Blob([fileContent]);
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  };



  private attachFileToItem = async (itemId: any) => {
    try {
      const formData = this.state.formData[this.state.counterProducts - 1];
      const fileContent: any = await this.readFile(formData.fileData);
      const fileName = formData.fileName; // Use the original file name
  
      console.log("Original File Name:", fileName);
      console.log("File Content:", fileContent);
  
      const response = await Web(this.props.url)
        .lists.getByTitle("DemandeAchat")
        .items.getById(itemId)
        .attachmentFiles.add(fileName, fileContent);
  
      console.log("File attached to item successfully:", response);
    } catch (error) {
      console.log("Error attaching file to item:", error);
    }
  };


  private getSubFamilyData = async(FamilleID) => {
    var sousFamilles = []
    const sousFamilyData = await getSubFamily(FamilleID.toString()) ;
    sousFamilyData.SubFamilies.map(sousFamily => {
      sousFamilles.push({
        key: sousFamily.IdSubFamily,
        text: sousFamily.DescSubFamily,
        FamilleKey: sousFamily.IdFamily,

      })
    })
    this.setState({subFamilyProducts:sousFamilles})
  }


  private getBeneficaire = () => {
    var listBenef = [{
      key: "COM",
      text: "COM",
    },
    {
      key: "AAC_TUNIS",
      text: "AAC TUNIS",
    },
    {
      key: "IMSET_TUNIS",
      text: "IMSET TUNIS",
    },
    {
      key: "SIEGE",
      text: "SIEGE",
    },
    {
      key: "AAC_NABEUL",
      text: "AAC NABEUL",
    },
    {
      key: "POLYTECH",
      text: "POLYTECH",
    },
    {
      key: "CLC",
      text: "CLC",
    },
    {
      key: "HEALTH",
      text: "HEALTH",
    },
    {
      key: "DG",
      text: "DG",
    },
    {
      key: "EXECUTIVE",
      text: "EXECUTIVE",
    },
    {
      key: "IT",
      text: "IT",
    },
    {
      key: "DSP",
      text: "DSP",
    },
    {
      key: "IMSET_NABEUL",
      text: "IMSET NABEUL",
    },
    {
      key: "IMSET GABES",
      text: "IMSET GABES",
    },
    {
      key: "IMSET SOUSSE",
      text: "IMSET SOUSSE",
    },
    {
      key: "IMSET_SFAX",
      text: "IMSET SFAX",
    },
    {
      key: "CC",
      text: "CC",
    },{
      key: "MSC",
      text: "MSC",
    }]
    return listBenef
  }


  private submitFormData = async () => {
    const disabledSubmit = this.disabledSubmitButton();
    const currentUser = await Web(this.props.url).currentUser.get();
    const DemandeID = this.getCurrentIDfromURL();
    const prevData = await this.getPrevDemandeInfo(DemandeID) ;


    
    // const BenefListData = this.getBeneficaire() ;
    var ArticleList = [];
    var prixTotal = 0;

    if (!disabledSubmit) {
        const data = this.state.formData;
        console.log(data) ;
        data.map(Article => {
          prixTotal = prixTotal + parseInt(Article.price);
          if (Article.fileData){
            ArticleList.push({
              "Prix": Article.price,
              "quantité": Article.quantity,
              "DescriptionTechnique": Article.Comment,
              "ArticleREF": Article.ArticleSelected[0].key,
              "ArticleFileName": Article.fileName, 
              "ArticleFileData": {
                "name": Article.fileData.name, 
                "size": Article.fileData.size,
                "type": Article.fileData.type,
                // "lastModified": Article.fileData.lastModified,
                // "lastModifiedDate": Article.fileData.lastModifiedDate,
              }
            });
          }else {
            ArticleList.push({
              "Prix": Article.price,
              "quantité": Article.quantity,
              "DescriptionTechnique": Article.Comment,
              "ArticleREF": Article.ArticleSelected[0].key,
              "ArticleFileName": Article.fileName, 
            });
          }
          
        });
      
        console.log(ArticleList)

        const getProbateurs = await Web(this.props.url).lists.getByTitle("ValidateurParEcole").items.filter("Ecole eq 'Ecole 3'").top(2000).orderBy("Created", false).get();

        var formData: {
          DemandeurId: number;
          FamilleProduit: any;
          PrixTotal: string;
          DelaiLivraisionSouhaite: number;
          Prix: string;
          Quantite: string;
          SousFamilleProduit: any;
          StatusDemande: string;
          StatusDemandeV1?: string;
          StatusDemandeV2?: string;
          StatusDemandeV3?: string;
          StatusDemandeV4?: string;
          Produit: any;
        };

        console.log(DemandeID);
        var Demande = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.filter(`DemandeID eq ${DemandeID}`).get();
        console.log(Demande);
        if (Demande[0].StatusApprobateurV1 === "A modifier") {
            console.log(1);
            var UserDisplayNameV1 = "";

            if (Demande[0].ApprobateurV1Id.length > 1){
              await Promise.all(
                Demande[0].ApprobateurV1Id.map(async (approbateur) => {
                  try {
                    const user = await Web(this.props.url).siteUsers.getById(approbateur).get();
                    const UserDisplayNameV1Title = user.Title;
      
                    if (UserDisplayNameV1.length === 0) {
                      UserDisplayNameV1 = UserDisplayNameV1Title;
                    } else {
                      UserDisplayNameV1 = UserDisplayNameV1 + " Ou " + UserDisplayNameV1Title;
                    }
                  } catch (error) {
                    console.error(`Error retrieving user information for ${approbateur}:`, error);
                  }
                })
              );
            }else {
              const user = await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV1Id[0]).get();
              UserDisplayNameV1 = user.Title;
            }

            formData = {
              "DemandeurId":currentUser.Id ,
              "FamilleProduit": data[0].FamilleSelected[0].text,
              "PrixTotal":prixTotal.toString(),
              "DelaiLivraisionSouhaite":data[0].numberOfDays,
              "Prix": "test ...." ,
              "Quantite": "test ....",
              "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
              "StatusDemande": "En cours de " + UserDisplayNameV1,
              "StatusDemandeV1": "En cours",
              "Produit": JSON.stringify(ArticleList),
            };
            console.log(formData)
            const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).update(formData);

            ArticleList.map(async (articleData, index) => {
              if (articleData && articleData.ArticleFileName){
                await this.attachFileToItem(parseInt(DemandeID))
              }else{
                console.log("the new file data : ",prevData[index].ArticleFileName)
                await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).attachmentFiles.getByName(prevData[index].ArticleFileName).delete()
              }
            })

            // Save historique block
            const historyData = await Web(this.props.url)
                .lists.getByTitle("HistoriqueDemande")
                .items.filter(`DemandeID eq ${DemandeID}`)
                .get();

            if (historyData.length > 0) {
                var resultArray = JSON.parse(historyData[0].Actions);
                resultArray.push(
                    "modifier par le demandeur a partir d'une demande de modification de la part de " +
                        UserDisplayNameV1 + " le "+ getCurrentDate()
                );
                resultArray.push(
                    "En cours de l'approbation de " +
                        UserDisplayNameV1 + " a partir de "+ getCurrentDate()
                );
                const saveHistorique = await Web(this.props.url)
                    .lists.getByTitle("HistoriqueDemande")
                    .items.getById(historyData[0].ID)
                    .update({
                        Actions: JSON.stringify(resultArray),
                    });
            }

            const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID)
            .update({
              StatusApprobateurV1: "En cours",
              Notif: "Y"
            });
        } else if (Demande[0].StatusApprobateurV2 === "A modifier") {
            console.log(2);
            var UserDisplayNameV2 = "";

            if (Demande[0].ApprobateurV2Id.length > 1){
              await Promise.all(
                Demande[0].ApprobateurV2Id.map(async (approbateur) => {
                  try {
                    const user = await Web(this.props.url).siteUsers.getById(approbateur).get();
                    const UserDisplayNameV2Title = user.Title;
      
                    if (UserDisplayNameV2.length === 0) {
                      UserDisplayNameV2 = UserDisplayNameV2Title;
                    } else {
                      UserDisplayNameV2 = UserDisplayNameV2 + " Ou " + UserDisplayNameV2Title;
                    }
                  } catch (error) {
                    console.error(`Error retrieving user information for ${approbateur}:`, error);
                  }
                })
              );
            }else {
              const user = await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV2Id[0]).get();
              UserDisplayNameV2 = user.Title;
            }

            formData = {
              "DemandeurId":currentUser.Id ,
              "FamilleProduit": data[0].FamilleSelected[0].text,
              "PrixTotal":prixTotal.toString(),
              "DelaiLivraisionSouhaite":data[0].numberOfDays,
              "Prix": "test ...." ,
              "Quantite": "test ....",
              "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
              "StatusDemande": "En cours de " + UserDisplayNameV2,
              "StatusDemandeV2": "En cours",
              "Produit": JSON.stringify(ArticleList),
            };
            const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).update(formData);

            ArticleList.map(async (articleData, index) => {
              if (articleData && articleData.ArticleFileName){
                await this.attachFileToItem(parseInt(DemandeID))
              }else{
                console.log("the new file data : ",prevData[index].ArticleFileName)
                await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).attachmentFiles.getByName(prevData[index].ArticleFileName).delete()
              }
            })

            // Save historique block
            const historyData = await Web(this.props.url)
              .lists.getByTitle("HistoriqueDemande")
              .items.filter(`DemandeID eq ${DemandeID}`)
              .get();

            if (historyData.length > 0) {
                var resultArray = JSON.parse(historyData[0].Actions);
                resultArray.push(
                    "modifier par le demandeur a partir d'une demande de modification de la part de " + UserDisplayNameV2 + " le "+ getCurrentDate()
                );
                resultArray.push("En cours de l'approbation de " + UserDisplayNameV2 + " a partir de" + getCurrentDate());
                const saveHistorique = await Web(this.props.url)
                  .lists.getByTitle("HistoriqueDemande")
                  .items.getById(historyData[0].ID)
                  .update({
                      Actions: JSON.stringify(resultArray),
                  });
            }

            const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID)
              .update({
                  StatusApprobateurV2: "En cours",
                  Notif: "Y"
              });
        } else if (Demande[0].StatusApprobateurV3 === "A modifier") {
            console.log(3);
            var UserDisplayNameV3 = "";

            if (Demande[0].ApprobateurV3Id.length > 1){
              await Promise.all(
                Demande[0].ApprobateurV3Id.map(async (approbateur) => {
                  try {
                    const user = await Web(this.props.url).siteUsers.getById(approbateur).get();
                    const UserDisplayNameV3Title = user.Title;
      
                    if (UserDisplayNameV3.length === 0) {
                      UserDisplayNameV3 = UserDisplayNameV3Title;
                    } else {
                      UserDisplayNameV3 = UserDisplayNameV3 + " Ou " + UserDisplayNameV3Title;
                    }
                  } catch (error) {
                    console.error(`Error retrieving user information for ${approbateur}:`, error);
                  }
                })
              );
            }else {
              const user = await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV3Id[0]).get();
              UserDisplayNameV2 = user.Title;
            }
            formData = {
              "DemandeurId":currentUser.Id ,
              "FamilleProduit": data[0].FamilleSelected[0].text,
              "PrixTotal":prixTotal.toString(),
              "DelaiLivraisionSouhaite":data[0].numberOfDays,
              "Prix": "test ...." ,
              "Quantite": "test ....",
              "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
              "StatusDemande": "En cours de " + UserDisplayNameV3,
              "StatusDemandeV3": "En cours",
              "Produit": JSON.stringify(ArticleList),
            };
            const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).update(formData);

            ArticleList.map(async (articleData, index) => {
              if (articleData && articleData.ArticleFileName){
                await this.attachFileToItem(parseInt(DemandeID))
              }else{
                console.log("the new file data : ",prevData[index].ArticleFileName)
                await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).attachmentFiles.getByName(prevData[index].ArticleFileName).delete()
              }
            })

            // Save historique block
            const historyData = await Web(this.props.url)
              .lists.getByTitle("HistoriqueDemande")
              .items.filter(`DemandeID eq ${DemandeID}`)
              .get();

            if (historyData.length > 0) {
              var resultArray = JSON.parse(historyData[0].Actions);
              resultArray.push(
                  "modifier par le demandeur a partir d'une demande de modification de la part de " + UserDisplayNameV3 + " le " + getCurrentDate()
              );
              resultArray.push(
                "En cours de l'approbation de " + UserDisplayNameV3 + " a partir de " + getCurrentDate() 
              );
              const saveHistorique = await Web(this.props.url)
                .lists.getByTitle("HistoriqueDemande")
                .items.getById(historyData[0].ID)
                .update({
                  Actions: JSON.stringify(resultArray),
                });
            }

            const updateWorkFlowApprobation = await Web(this.props.url)
              .lists.getByTitle("WorkflowApprobation")
              .items.getById(Demande[0].ID)
              .update({
                  StatusApprobateurV3: "En cours",
                  Notif: "Y"
              });
        } else if (Demande[0].StatusApprobateurV4 === "A modifier") {
          console.log(3);
          var UserDisplayNameV4 = "";
          if (Demande[0].ApprobateurV4Id.length > 1){
            await Promise.all(
              Demande[0].ApprobateurV4Id.map(async (approbateur) => {
                try {
                  const user = await Web(this.props.url).siteUsers.getById(approbateur).get();
                  const UserDisplayNameV4Title = user.Title;
    
                  if (UserDisplayNameV4.length === 0) {
                    UserDisplayNameV4 = UserDisplayNameV4Title;
                  } else {
                    UserDisplayNameV4 = UserDisplayNameV4 + " Ou " + UserDisplayNameV4Title;
                  }
                } catch (error) {
                  console.error(`Error retrieving user information for ${approbateur}:`, error);
                }
              })
            );
          }else {
            const user = await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV4Id[0]).get();
            UserDisplayNameV2 = user.Title;
          }
          formData = {
            "DemandeurId":currentUser.Id ,
            "FamilleProduit": data[0].FamilleSelected[0].text,
            "PrixTotal":prixTotal.toString(),
            "DelaiLivraisionSouhaite":data[0].numberOfDays,
            "Prix": "test ...." ,
            "Quantite": "test ....",
            "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
            "StatusDemande": "En cours de " + UserDisplayNameV4,
            "StatusDemandeV4": "En cours",
            "Produit": JSON.stringify(ArticleList),
          };
          const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).update(formData);


          ArticleList.map(async (articleData, index) => {
            if (articleData && articleData.ArticleFileName){
              await this.attachFileToItem(parseInt(DemandeID))
            }else{
              console.log("the new file data : ",prevData[index].ArticleFileName)
              await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).attachmentFiles.getByName(prevData[index].ArticleFileName).delete()
            }
          })

          // Save historique block
          const historyData = await Web(this.props.url)
            .lists.getByTitle("HistoriqueDemande")
            .items.filter(`DemandeID eq ${DemandeID}`)
            .get();

          if (historyData.length > 0) {
            var resultArray = JSON.parse(historyData[0].Actions);
            resultArray.push(
                "modifier par le demandeur a partir d'une demande de modification de la part de " + UserDisplayNameV4 + " le " + getCurrentDate()
            );
            resultArray.push(
              "En cours de l'approbation de " + UserDisplayNameV4 + " a partir de " + getCurrentDate() 
            );
            const saveHistorique = await Web(this.props.url)
              .lists.getByTitle("HistoriqueDemande")
              .items.getById(historyData[0].ID)
              .update({
                Actions: JSON.stringify(resultArray),
              });
          }

          const updateWorkFlowApprobation = await Web(this.props.url)
            .lists.getByTitle("WorkflowApprobation")
            .items.getById(Demande[0].ID)
            .update({
                StatusApprobateurV4: "En cours",
                Notif: "Y"
            });
      }
      this.setState({ showValidationPopUp: true });
    }
  };

  private handleInputChange = (event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].numberOfDays = event.target.value
    this.setState({
      formData: updatedFormData
    });
  }


  // public async getUserInfoFromERP1(establishment, registrationNumber) {
  //   try {
  //     const response = await fetch(GetUserInfoURL, {
  //       method: 'POST',
  //       headers: new Headers({ "Authorization": `Basic ${btoa(`INTRANET:UCG2021*++`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
  //       body: JSON.stringify({ "establishment": establishment, "registrationNumber": registrationNumber }),
  //     });
  //     console.log('response', response);
  //     let erp = await response.json();
  //     console.log('erp', erp);
  //     // this.setState({
  //     //   JobTitle: erp.data.Fonction,
  //     // });
  //     console.log('All userData from ERP:',erp.data)
  //     console.log('USER JOB: ',erp.data.Fonction)
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  


  private getPrevDemandeInfo = async(demanedID) => {
    const data = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(demanedID).get() ;
    var listProduits = JSON.parse(data.Produit)
    return listProduits ;
  }


  public getCurrentIDfromURL = () => {
    const currentURL = window.location.href;
    const urlOBJ = new URL(currentURL) ;
    return urlOBJ.searchParams.get('itemID');
  }


  public getCurrentDemandeInfo = async() => {
    const demandeID = this.getCurrentIDfromURL()
    const demandeData = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(demandeID)).get()
    var listProduits = JSON.parse(demandeData.Produit)
    var index = 0

    console.log(demandeData)
    console.log(listProduits)

    listProduits.map(produit => {
      index = index + 1 ;
      const updatedFormData = [...this.state.formData];
      console.log(updatedFormData)
      if(index === 1){
        const updatedFormData = [...this.state.formData];
        updatedFormData[index-1].FamilleSelected = [{"key":demandeData.FamilleProduitREF}]
        updatedFormData[index-1].SousFamilleSelected = [{"key":demandeData.SousFamilleProduitREF}]
        updatedFormData[index-1].ArticleSelected = [{"key":produit.ArticleREF}]
        updatedFormData[index-1].BeneficiareSelected = [{"key":demandeData.BeneficiaireID}]
        updatedFormData[index-1].Comment = produit.DescriptionTechnique
        updatedFormData[index-1].quantity = produit.quantité
        updatedFormData[index-1].price = produit.Prix
        updatedFormData[index-1].DateSouhaite = demandeData.DelaiLivraisionSouhaite
        updatedFormData[index-1].numberOfDays = demandeData.DelaiLivraisionSouhaite
        updatedFormData[index-1].fileName = produit.ArticleFileData.name
        updatedFormData[index-1].fileData = {
          "name":produit.ArticleFileData.name,
          "size":produit.ArticleFileData.size,
          "type":produit.ArticleFileData.type,
        }
        this.setState({
          formData: updatedFormData,
          FamilleID: updatedFormData[0].FamilleSelected[0].key,
          SousFamilleID : updatedFormData[0].SousFamilleSelected[0].key,
          CentreDeGestion: demandeData.CentreDeGestion
        });
      }else {
        var nullObject
        if (produit.ArticleFileData){
          nullObject = {
            FamilleSelected: [{"key":demandeData.FamilleProduitREF}],
            SousFamilleSelected: [{"key":demandeData.SousFamilleProduitREF}],
            ArticleSelected: [{"key":produit.ArticleREF}],
            BeneficiareSelected: "",
            Comment: produit.DescriptionTechnique,
            quantity:produit.quantité,
            price:produit.Prix,
            numberOfDays: demandeData.DelaiLivraisionSouhaite,
            DateSouhaite: demandeData.DelaiLivraisionSouhaite,
            fileData:{
              "name":produit.ArticleFileData.name,
              "size":produit.ArticleFileData.size,
              "type":produit.ArticleFileData.type,
            }, 
            fileName: produit.ArticleFileData.name,
          };
        }else {
          nullObject = {
            FamilleSelected: [{"key":demandeData.FamilleProduitREF}],
            SousFamilleSelected: [{"key":demandeData.SousFamilleProduitREF}],
            ArticleSelected: [{"key":produit.ArticleREF}],
            BeneficiareSelected: "",
            Comment: produit.DescriptionTechnique,
            quantity:produit.quantité,
            price:produit.Prix,
            numberOfDays: demandeData.DelaiLivraisionSouhaite,
            DateSouhaite: demandeData.DelaiLivraisionSouhaite,
            fileData:{
              "name":"",
              "size":"",
              "type":"",
            }, 
            fileName: "",
          };
        }
    
        const updatedFormData = [...this.state.formData];
        updatedFormData.push(nullObject);
        this.setState({
          formData: updatedFormData,
          counterProducts: this.state.counterProducts + 1,
          FamilleID: updatedFormData[0].FamilleSelected[0].key,
        })
      }
    })
  }


  async componentDidMount() {
    this.loadUserInfo() ;
    await this.getCurrentDemandeInfo() ;


    // Get all famille products
    const listFamilleProduit = [] ;
    const familyProducts = await getFamily() ;
    familyProducts.Families.map(famille => {
      listFamilleProduit.push({
        key: famille.IdFamily,
        text: famille.DescFamily,
      })
    })
    this.setState({familyProducts:listFamilleProduit})
    await this.getSubFamilyData(this.state.FamilleID)

    const items = await getProduct(this.state.SousFamilleID, this.state.CentreDeGestion) ;
    const listArticles = items.Items.map(item => ({
      key: item.RefItem, 
      LatestPurchasePrice: item.LatestPurchasePrice,
      text: item.DesignationItem, 
      BudgetAnnualUsed: item.BudgetAnnualUsed,
      BudgetAnnualRemaining: item.BudgetAnnualRemaining, 
      BudgetAnnualAllocated: item.BudgetAnnualAllocated, 
      Axe: item.Axe,  
    }));
    this.setState({articles:listArticles})
  }

  public render(): React.ReactElement<IModifierDemandeProps> {
    const dropdownStyles: Partial<IDropdownStyles> = {
      title: { backgroundColor: "white" },
    };

    const controlClass = mergeStyleSets({
      TextField: { backgroundColor: "white", }
    });

    const disabledSubmit = this.disabledSubmitButton()
    return (
      <Fabric
        className="App"
        style={{ background: theme.semanticColors.bodyBackground, color: theme.semanticColors.bodyText }}
      >
        <div className={stylescustom.modifierDemande}>
          <div className={stylescustom.DC}>
            <p className={stylescustom.datenow}>Date : <span className="date-time">{FormatDate(new Date())}</span></p>
            <div className={stylescustom.titleh1}>Modifier demande d'achat </div>
            <div className={stylescustom.line}></div>
            <div className={stylescustom.row}>
              <div className={stylescustom.col}>
                <table className={stylescustom.table}>
                  <tbody>
                    <tr>
                      <td className={stylescustom.key}>Nom de l'employé</td>
                      <td className={stylescustom.value}>{this.state.userName}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Adresse email de l'organisation</td>
                      <td className={stylescustom.value}>{this.state.userEmail}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Matricule employé</td>
                      <td className={stylescustom.value}>{this.state.userRegistrationNumber}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Entité professionnelle</td>
                      <td className={stylescustom.value}>{this.state.userEstablishment}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Post</td>
                      <td className={stylescustom.value}>{this.state.JobTitle}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p className={stylescustom.indique}>* Indique un champ obligatoire</p>

            {this.intToList(this.state.counterProducts).map((index) => 
              <div className='productsDiv'>
                <div className={stylescustom.row}>

                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}>Bénificaire / Déstinataire</p>
                    <Dropdown
                      disabled={!this.state.DisabledBenef}
                      styles={dropdownStyles}
                      defaultSelectedKey={this.state.formData[index - 1]["BeneficiareSelected"] && this.state.formData[index - 1]["BeneficiareSelected"][0] ? this.state.formData[index - 1]["BeneficiareSelected"][0].key : ""}
                      onChange={this.onSelectionChanged}
                      onRenderTitle={this.onRenderTitle}
                      onRenderOption={this.onRenderOption}
                      onRenderCaretDown={this.onRenderCaretDown}
                      options={this.getBeneficaire()}                      
                      onChanged={(value) => this.handleChangeDestinataireDropdown(value, index)}
                      style={{ width: '200px' }} // Specify the width you desire
                    />
                  </div>

                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}>* Famille</p>
                    {index > 1 ? (
                      <label className={stylescustom.btn} style={{width: '180px'}}>{this.state.formData[0].FamilleSelected[0].text}</label>
                    ) : (
                      <Dropdown
                        defaultValue={this.state.formData[index - 1]?.FamilleSelected?.[0]?.key || ""}
                        styles={dropdownStyles}
                        onRenderTitle={this.onRenderTitle}
                        onRenderOption={this.onRenderOption}
                        onRenderCaretDown={this.onRenderCaretDown}
                        options={this.state.familyProducts}
                        onChanged={(value) => this.handleChangeFamilleDropdown(value, index)}
                        defaultSelectedKey={this.state.formData[index - 1]?.FamilleSelected?.[0]?.key || ""}
                        style={{ width: '200px' }}
                      />
                    )}
                  </div>

                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}>* Sous famille</p>
                    <Dropdown
                      style={{ width: '200px' }} // Specify the width you desire
                      defaultSelectedKey={this.state.formData[index - 1]['SousFamilleSelected'] && this.state.formData[index - 1]['SousFamilleSelected'][0] ? this.state.formData[index - 1]['SousFamilleSelected'][0].key : ""}
                      styles={dropdownStyles}
                      onRenderTitle={this.onRenderTitle}
                      onRenderOption={this.onRenderOption}
                      onRenderCaretDown={this.onRenderCaretDown}
                      options={this.state.subFamilyProducts} 
                      onChanged={(value) => this.handleChangeSousFamilleDropdown(value, index)}                                         
                    />
                  </div>


                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}>* Réference de l'article</p>
                    <Dropdown
                      styles={dropdownStyles}
                      defaultValue={this.state.formData[index - 1]?.ArticleSelected?.[0]?.key || ""}
                      defaultSelectedKey={this.state.formData[index - 1]["ArticleSelected"] && this.state.formData[index - 1]["ArticleSelected"][0] ? this.state.formData[index - 1]["ArticleSelected"][0].key : ""}
                      onChange={this.onSelectionChanged}
                      onRenderTitle={this.onRenderTitle}
                      onRenderOption={this.onRenderOption}
                      onRenderCaretDown={this.onRenderCaretDown}
                      options={this.state.articles}                       
                      onChanged={(value) => this.handleChangeArticleDropdown(value, index)}
                      style={{ width: '200px' }} // Specify the width you desire
                    />
                  </div>
                </div>


                <div className={stylescustom.row}>
                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}>* Quantité demandée :</p>
                    <TextField 
                      className={controlClass.TextField} 
                      type='number'
                      onChange={(e) => this.handleChangeQuantity(e, index)}
                      min={0}
                      value={ this.state.formData[index - 1]["quantity"] && this.state.formData[index - 1]["quantity"] ? this.state.formData[index - 1]["quantity"] : ""} 
                    />
                  </div>

                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}>* Prix estimatifs :</p>
                    <TextField 
                      type='number'
                      min={0}
                      className={controlClass.TextField} 
                      onChange={(e) => this.handleChangePrice(e, index)}
                      value={this.state.formData[index - 1]["price"]} 
                    />
                  </div>


                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}>* Delai le livraison souhaité :</p>
                    <TextField 
                      type='number'
                      min={0}
                      value={String(this.state.formData[index - 1]["numberOfDays"])} 
                      onChange={(e) => this.handleInputChange(e, index)}
                    />
                  </div>

                  {index-1 === 0 && <div className={stylescustom.data}>
                      <p className={stylescustom.title}> Piéce jointe :</p>
                      <label htmlFor="uploadFile" className={stylescustom.btn}>Choisir un élément</label>
                      <input type="file" id="uploadFile" style={{ display: 'none' }}
                        accept=".jpg, .jpeg, .png , .pdf , .doc ,.docx"
                        onChange={(e) => { 
                          this.addFile(e); 
                          this.setState({ errors: { ...this.state.errors, file: "" } });}} 
                        />
                      {this.state.formData[index - 1].fileData && <span style={{ marginLeft: 10, fontSize: 14 }}>{this.state.formData[index - 1].fileName} <span style={{ cursor: 'pointer' }} onClick={() => { this.initImage(index); }}>&#10006;</span></span>}
                      <span style={{ color: "rgb(168, 0, 0)", fontSize: 12, fontWeight: 400, display: 'block' }}>
                        {this.state.errors.file !== "" ? this.state.errors.file : ""}
                      </span>
                    </div>
                  }
                </div>


                <div className={stylescustom.row}>
                  <div className={stylescustom.comment}>
                    <p className={stylescustom.title}>* Description :</p>
                    <TextField 
                      className={controlClass.TextField} 
                      value={this.state.formData[index - 1]["Comment"]} 
                      multiline 
                      onChange={(e) => this.handleChangeComment(e, index)}
                    />
                  </div>
                </div>
                <br></br>
                {this.state.counterProducts > 1 && <div className={stylescustom.line}></div>}
              </div>
            )}


            <table className={stylescustom.ad}>
              <thead>
                <th className={stylescustom.title} >Autres détails</th>
              </thead>
              <tbody className={stylescustom.tbody}>
                {console.log(this.state.formData)}
                {this.state.axePerBuget.map((article, index) =>
                  article &&
                  <>
                    {console.log("Axe data:",this.state.axePerBuget)}
                    <tr>
                      <td className={stylescustom.key}>Le montant du budget annuel alloué</td>
                      <td className={stylescustom.value}>{article.BudgetAnnualAllocated}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Le montant du budget annuel restant</td>
                      <td className={stylescustom.value}>{article.BudgetAnnualRemaining}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Le montant du budget annuel utilisé</td>
                      <td className={stylescustom.value}>{article.BudgetAnnualUsed}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>


            

            <div className={stylescustom.btncont}>
              {this.state.loadingFile ? <Spinner size={SpinnerSize.large} className={stylescustom.spinner} /> : ""}
              {/* <button disabled={this.state.btnSubmitDisable || this.state.loadingFile} onClick={() => this.SaveData()} className={stylescustom.btn}>soumettre la demande</button> */}
              <button disabled={disabledSubmit} className={stylescustom.btn} onClick={() => this.addArticle()}>AJOUTER UNE AUTRE ARTICLE</button>
              <button disabled={disabledSubmit} className={stylescustom.btn} onClick={() => this.submitFormData()}>soumettre la demande</button>
            </div>

            
            <SweetAlert2
              allowOutsideClick={false}
              show={this.state.showValidationPopUp} 
              title="Demande des Articles" 
              text="Demande envoyée"
              imageUrl={img}
              confirmButtonColor='#7D2935'
              onConfirm={() => window.open(this.props.url + "/SitePages/DashboardDemandeur.aspx", "_self")}
              imageWidth="150"
              imageHeight="150"
            />

            {/* <SweetAlert2
              show={true} title="Demande de congé" text="Votre solde de congé est insuffisant"
              imageUrl={img}
              confirmButtonColor='#7D2935'
              onConfirm={() => this.setState({ alerteligibility: false })}
              imageWidth="200"
              imageHeight="200"
            /> */}
          </div>
        </div>
      </Fabric>
    );
  }
}
