import * as React from 'react';
import stylescustom from './UpdateDemandeAchat.module.scss';
import styles from '../../demandeurDashboard/components/DemandeurDashboard.module.scss';
import { IUpdateDemandeAchatProps } from './IUpdateDemandeAchatProps';
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
import { ChoiceGroup, IChoiceGroupOption } from '@fluentui/react/lib/ChoiceGroup';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import {
  Fabric,
  loadTheme
} from "office-ui-fabric-react";
import { getTheme } from "@uifabric/styling";
import { Web } from '@pnp/sp/webs';
import { IItemAddResult } from '@pnp/sp/items';
import GraphService from '../../../services/GraphServices';
import { checkIfAxeExists, checkRodondanceApprouvers, convertFileToBase64, convertStringToNumber, getAllArticles, getApprobateurNiveau, getCurrentDate, removeDuplicates2 } from '../../../tools/FunctionTools';
import { getUserInfo } from "../../../services/getUserInfo";
import { getSubFamily } from "../../../services/getProductsSubFamily";
import { getFamily } from "../../../services/getAllProductFamily";
import { getProduct } from "../../../services/getProducts";
import { getApprouverList } from "../../../services/getApprouveurs";
import { getBenefList } from "../../../services/getListBenefPermissions";
import { APPROUVER_V4 } from '../../../API_END_POINTS/userApprouverV4';
import { REDIRECTION_URL } from '../../../API_END_POINTS/redirectionURL';

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

export default class UpdateDemandeAchat extends React.Component<IUpdateDemandeAchatProps, {}> {

  // State variables of webpart 
  public state = {

    formData: [{
      FamilleSelected: [] as any,
      SousFamilleSelected: [] as any,
      AllArticleData: [] as any,
      ArticleSelected: [] as any,
      BeneficiareSelected: [] as any,
      Comment: "",
      quantity: "1",
      price: "0.0",
      DateSouhaite: new Date(),
      numberOfDays: "",
      fileData: "" as any,
      fileName: "",
    }],

    familyProducts: [],
    subFamilyProducts: [],
    articles: [],
    axePerBuget: [],
    CentreDeGestion: "",


    FamilleID: "",
    SousFamilleID: "",
    ArticleID: "",

    ID: 0,
    userUPN: "",
    userId: "",
    userRegistrationNumber: "",
    userEstablishment: "",
    userName: "",
    userEmail: "",
    JobTitle: "",
    userRespCenter: "",

    RemplacantID: 0,
    RemplacantUserUPN: "",
    RemplacantUserId: "",
    RemplacantUserRegistrationNumber: "",
    RemplacantUserEstablishment: "",
    RemplacantUserName: "",
    RemplacantUserEmail: "",
    RemplacantJobTitle: "",
    RemplacantRespCenter: "",

    file: "" as null,
    loadingFile: false,
    fileName: "",
    MontantAlloue: 0,
    MontantConsommer: 0,
    MontantRestant: 0,
    counterProducts: 1,
    showValidationPopUp: false,
    errors: { file: "" },

    showOnConfirmButtonPopUp: true,
    spinnerShow: false,

    checkRemplacant: false,
    showAnotePopUp: false,
    remplacantName: "",
    remplacantID: 0,
    demandeAffectation: "me",

    checkActionCurrentUser: true,
    checkActionCurrentUserPopUp: false,
    DisabledBenef: true,
    condition: 0,
    showPopUpApprouver4: false,
    totalPrixErrorMessage: 0,
    axeBudgets: []
  };
  private _graphService = new GraphService(this.props.context);


  // private dropdownOptionsListFamille: { key: string, text: string, data: any }[] = [];
  // private dropdownOptionsListSousFamille: { key: string, text: string, data: any }[] = [];
  // private dropdownOptionsRefArticles: { key: string, text: string, data: any }[] = [];
  // private dropdownOptionsBeneficiaire: { key: string, text: string, data: any }[] = [];



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
    updatedFormData[index - 1].fileData = null
    updatedFormData[index - 1].fileName = null
    this.setState({
      formData: updatedFormData,
    });
    (document.getElementById('uploadFile') as HTMLInputElement).value = "";
  }


  private checkUserActions = async () => {
    const currentUserID: number = (await Web(this.props.url).currentUser.get()).Id;
    const now: string = new Date().toISOString(); // Format the current date to ISO 8601
    const remplacantTest = await Web(this.props.url).lists.getByTitle('RemplacantsModuleAchat').items
      .filter(`DemandeurId eq ${currentUserID} and DateDeDebut lt '${now}' and DateDeFin gt '${now}' and TypeRemplacement eq 'D'`)
      .orderBy('Created', false)
      .top(1)
      .get();

    if (remplacantTest.length > 0) {
      this.setState({ checkActionCurrentUser: false, checkActionCurrentUserPopUp: true });
    }
  }


  private getUserInfo = async (establishment, registrationNumber) => {
    const data = await getUserInfo(establishment, registrationNumber);
    return data
  }


  private handleChangeQuantity = (event: any, index: any) => {
    const inputValue = event.target.value;
    // Check if inputValue is a valid number
    if (!isNaN(inputValue) && inputValue !== '') {
      const updatedFormData = [...this.state.formData];
      updatedFormData[index - 1].quantity = inputValue;
      this.setState({
        formData: updatedFormData
      });
    }
  }


  public addFile = async (content: any) => {
    console.log(this.state.counterProducts);

    const fileName = content.target.files[0].name;
    const extension = fileName.split('.').pop();
    const encodedFileName = `${fileName.split('.').slice(0, -1).join('.')}.${extension}`;

    const newFile = new File([content.target.files[0]], encodedFileName, { type: content.target.files[0].type });

    const updatedFormData = [...this.state.formData];
    updatedFormData[0].fileName = fileName; // Store the original file name
    updatedFormData[0].fileData = newFile;


    this.setState({
      formData: updatedFormData,
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


  private handleChangePrice = (event: any, index: any) => {
    const inputValue = event.target.value;

    // Check if inputValue is a valid number
    if (!isNaN(inputValue) && inputValue !== '') {
      const updatedFormData = [...this.state.formData];
      updatedFormData[index - 1].price = inputValue;

      this.setState({
        formData: updatedFormData
      });
    }
  }



  private handleChangeComment = (event: any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index - 1].Comment = event.target.value
    this.setState({
      formData: updatedFormData
    });
  }


  private handleChangeFamilleDropdown = async (event: any, index: any) => {
    console.log(event)
    const updatedFormData = [...this.state.formData];
    console.log(updatedFormData)
    updatedFormData[index - 1].FamilleSelected = [event];
    updatedFormData[index - 1].ArticleSelected = [];
    updatedFormData[index - 1].AllArticleData = [];


    this.setState({
      formData: updatedFormData,
      FamilleID: event.key,
      SousFamilleID: "",
      ArticleID: "",
      // articles: [],
      // axePerBuget: []
      // updatedFormData[index - 1]["ArticleSelected"][0].key : ""
    });
    await this.getSubFamilyData(event.key)
  }


  private handleChangeSousFamilleDropdown = async (event: any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index - 1].SousFamilleSelected = [event]
    updatedFormData[index - 1].ArticleSelected = [];

    if (this.state.DisabledBenef === false) {
      console.log(event.key, updatedFormData[index - 1])
      console.log(event.key, updatedFormData[index - 1].BeneficiareSelected[0].text)

      const items = await getProduct(event.key, updatedFormData[index - 1].BeneficiareSelected[0].text);
      console.log(items)

      const listArticles = items.Items.map(item => ({
        key: item.RefItem,
        LatestPurchasePrice: item.LatestPurchasePrice,
        text: item.DesignationItem,
        BudgetAnnualUsed: item.BudgetAnnualUsed,
        BudgetAnnualRemaining: item.BudgetAnnualRemaining,
        BudgetAnnualAllocated: item.BudgetAnnualAllocated,
        Axe: item.Axe,
      }));

      console.log(index)
      console.log(updatedFormData)
      updatedFormData[index - 1].AllArticleData = listArticles
      this.setState({
        formData: updatedFormData,
        SousFamilleID: event.key,
      });
      console.log(event.key)
      console.log(this.state.userRespCenter)
      this.setState({ articles: listArticles })
    } else {
      const items = await getProduct(event.key, updatedFormData[0].BeneficiareSelected[0].text);
      console.log(items)

      const listArticles = items.Items.map(item => ({
        key: item.RefItem,
        LatestPurchasePrice: item.LatestPurchasePrice,
        text: item.DesignationItem,
        BudgetAnnualUsed: item.BudgetAnnualUsed,
        BudgetAnnualRemaining: item.BudgetAnnualRemaining,
        BudgetAnnualAllocated: item.BudgetAnnualAllocated,
        Axe: item.Axe,
      }));

      console.log(index)
      console.log(updatedFormData)
      updatedFormData[index - 1].AllArticleData = listArticles
      this.setState({
        formData: updatedFormData,
        SousFamilleID: event.key,
      });
      console.log(event.key)
      console.log(this.state.userRespCenter)
      this.setState({ articles: listArticles })
    }


  }


  private handleChangeArticleDropdown = (event: any, index: any) => {
    console.log(event)
    const updatedFormData = [...this.state.formData];
    updatedFormData[index - 1].ArticleSelected = [event];

    this.setState({
      formData: updatedFormData,
      // axePerBuget: newAxeList
    });
  }


  private handleChangeDestinataireDropdown = async (event: any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index - 1].BeneficiareSelected = [event]
    this.setState({
      formData: updatedFormData
    });

    // Get all famille products
    const listFamilleProduit = [];
    const familyProducts = await getFamily();
    familyProducts.Families.map(famille => {
      listFamilleProduit.push({
        key: famille.IdFamily,
        text: famille.DescFamily,

      })
    })
    this.setState({ familyProducts: listFamilleProduit })
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
      FamilleSelected: this.state.formData[0].FamilleSelected,
      SousFamilleSelected: [] as any,
      AllArticleData: [],
      ArticleSelected: [] as any,
      BeneficiareSelected: [] as any,
      Comment: "",
      quantity: "1",
      price: "0.0",
      numberOfDays: "",
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

  private deleteArticle = (index: number) => {
    // Make a copy of the current formData array
    const updatedFormData = [...this.state.formData];

    // Remove the article at the specified index
    updatedFormData.splice(index, 1);

    // Update the state with the new formData array and decrement the counterProducts
    this.setState({
      formData: updatedFormData,
      counterProducts: this.state.counterProducts - 1,
    });
  }


  private disabledSubmitButton = () => {
    if (this.state.DisabledBenef) {
      return this.state.formData.some(formData => (
        formData.FamilleSelected.length === 0 ||
        formData.SousFamilleSelected.length === 0 ||
        formData.ArticleSelected.length === 0 ||
        formData.quantity.length === 0 ||
        formData.price.length === 0 ||
        formData.Comment.length === 0 ||
        formData.numberOfDays.length === 0
      ));
    } else {
      return this.state.formData.some(formData => (
        formData.FamilleSelected.length === 0 ||
        formData.SousFamilleSelected.length === 0 ||
        formData.BeneficiareSelected.length === 0 ||
        formData.ArticleSelected.length === 0 ||
        formData.quantity.length === 0 ||
        formData.price.length === 0 ||
        formData.Comment.length === 0 ||
        formData.numberOfDays.length === 0
      ));
    }
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
      const formData = this.state.formData[0];
      console.log(formData)
      if (formData.fileName) {
        const fileContent: any = await this.readFile(formData.fileData);
        const fileName = formData.fileName; // Use the original file name
        console.log("Original File Name:", fileName);
        console.log("File Content:", fileContent);
        const response = await Web(this.props.url)
          .lists.getByTitle("DemandeAchat")
          .items.getById(itemId)
          .attachmentFiles.add(fileName, fileContent);
        console.log("File attached to item successfully:", response);
      }
    } catch (error) {
      console.log("Error attaching file to item:", error);
    }
  };



  private getSubFamilyData = async (FamilleID) => {
    var sousFamilles = []
    const sousFamilyData = await getSubFamily(FamilleID.toString());
    sousFamilyData.SubFamilies.map(sousFamily => {
      sousFamilles.push({
        key: sousFamily.IdSubFamily,
        text: sousFamily.DescSubFamily,
        FamilleKey: sousFamily.IdFamily,
      })
    })
    this.setState({ subFamilyProducts: sousFamilles })
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
    }, {
      key: "MSC",
      text: "MSC",
    }, {
      key: "UPSAT TUNIS",
      text: "UPSAT TUNIS",
    }, {
      key: "UPSAT SOUSSE",
      text: "UPSAT SOUSSE",
    }, {
      key: "UPSAT SFAX",
      text: "UPSAT SFAX",
    }]
    return listBenef
  }


  private handleSpinnerButtonClick = () => {

    this.setState({ spinnerShow: true })

    setTimeout(() => {
      this.setState({ spinnerShow: false })
    }, 3000);
  };


  private _onChange = (ev: React.FormEvent<HTMLInputElement>, option: IChoiceGroupOption) => {
    console.log(option)
    this.setState({ demandeAffectation: option.key })
  }


  public async getUserEmailById(userId: number) {
    try {
      const user = await Web(this.props.url).getUserById(userId);
      console.log(user)
    } catch (error) {
      throw error;
    }
  }

  public getCurrentIDfromURL = () => {
    const currentURL = window.location.href;
    const urlOBJ = new URL(currentURL);
    return urlOBJ.searchParams.get('itemID');
  }

  public getCurrentDemandeInfo = async () => {
    const demandeID = this.getCurrentIDfromURL()
    const demandeData = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(demandeID)).get()
    var listProduits = JSON.parse(demandeData.Produit)
    var index = 0

    console.log(demandeData)
    console.log(demandeData.StatusBeneficiaire)
    console.log(listProduits)

    listProduits.map(produit => {
      console.log(produit)
      index = index + 1;
      const updatedFormData = [...this.state.formData];
      console.log(demandeData.StatusBeneficiaire === "true" ? true : false)
      if (index === 1) {
        const updatedFormData = [...this.state.formData];
        updatedFormData[index - 1].FamilleSelected = [{ "key": demandeData.FamilleProduitREF, "text": demandeData.FamilleProduit }]
        updatedFormData[index - 1].SousFamilleSelected = [{ "key": produit.SousFamilleID, "text": produit.SousFamille }]
        updatedFormData[index - 1].ArticleSelected = [{ "key": produit.ArticleREF, "text": produit.DescriptionTechnique, "Axe": produit.Axe, "BudgetAnnualAllocated": produit.BudgetAnnualAllocated, "BudgetAnnualRemaining": produit.BudgetAnnualRemaining, "BudgetAnnualUsed": produit.BudgetAnnualUsed, "LatestPurchasePrice": produit.LatestPurchasePrice }],
          updatedFormData[index - 1].BeneficiareSelected = [{ "key": produit.BeneficiaireID, "text": produit.Beneficiaire }]
        updatedFormData[index - 1].Comment = produit.comment
        updatedFormData[index - 1].quantity = produit.quantité
        updatedFormData[index - 1].price = produit.Prix
        updatedFormData[index - 1].DateSouhaite = produit.DelaiLivraisionSouhaite
        updatedFormData[index - 1].numberOfDays = produit.DelaiLivraisionSouhaite
        updatedFormData[index - 1].fileName = produit.ArticleFileData.name
        updatedFormData[index - 1].fileData = {
          "name": produit.ArticleFileData.name,
          "size": produit.ArticleFileData.size,
          "type": produit.ArticleFileData.type,
        }
        this.setState({
          formData: updatedFormData,
          FamilleID: updatedFormData[0].FamilleSelected[0].key,
          SousFamilleID: updatedFormData[0].SousFamilleSelected[0].key,
          CentreDeGestion: demandeData.CentreDeGestion,
          DisabledBenef: demandeData.StatusBeneficiaire === "true" ? true : false
        });

        console.log(updatedFormData)
        console.log(updatedFormData[0].FamilleSelected[0].key)
        console.log(updatedFormData[0].SousFamilleSelected[0].key)
        console.log(demandeData.CentreDeGestion)

      } else {
        var nullObject
        nullObject = {
          FamilleSelected: [{ "key": demandeData.FamilleProduitREF, "text": demandeData.FamilleProduit }],
          SousFamilleSelected: [{ "key": produit.SousFamilleID, "text": produit.SousFamille }],
          ArticleSelected: [{ "key": produit.ArticleREF, "text": produit.DescriptionTechnique, "Axe": produit.Axe, "BudgetAnnualAllocated": produit.BudgetAnnualAllocated, "BudgetAnnualRemaining": produit.BudgetAnnualRemaining, "BudgetAnnualUsed": produit.BudgetAnnualUsed, "LatestPurchasePrice": produit.LatestPurchasePrice }],
          BeneficiareSelected: [{ "key": produit.BeneficiaireID, "text": produit.Beneficiaire }],
          Comment: produit.comment,
          quantity: produit.quantité,
          price: produit.Prix,
          numberOfDays: produit.DelaiLivraisionSouhaite,
          DateSouhaite: produit.DelaiLivraisionSouhaite,
          fileName: "",
          fileData: {
            "name": "",
            "size": "",
            "type": "",
          }
        };

        const updatedFormData = [...this.state.formData];
        updatedFormData.push(nullObject);
        this.setState({
          formData: updatedFormData,
          counterProducts: this.state.counterProducts + 1,
          FamilleID: updatedFormData[0].FamilleSelected[0].key,
          DisabledBenef: demandeData.StatusBeneficiaire === "true" ? true : false
        })
        console.log(updatedFormData)
        console.log(this.state.counterProducts + 1)
        console.log(updatedFormData[0].FamilleSelected[0].key)
      }
    })
  }


  private getPrevDemandeInfo = async (demanedID) => {
    const data = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(demanedID).get();
    var listProduits = JSON.parse(data.Produit)
    return listProduits;
  }


  private submitFormData = async () => {
    const disabledSubmit = this.disabledSubmitButton();
    const DemandeID = this.getCurrentIDfromURL();

    const prevData = await this.getPrevDemandeInfo(DemandeID);

    console.log(this.state.CentreDeGestion);

    var ArticleList = [];
    var prixTotal = 0;

    if (!disabledSubmit) {
      const data = this.state.formData;
      console.log(data);
      data.map(Article => {
        console.log("Article", Article)
        prixTotal = prixTotal + (parseFloat(Article.price) * parseInt(Article.quantity));
        console.log(!this.state.DisabledBenef)
        if (!this.state.DisabledBenef) {
          console.log(1)
          if (Article.fileName !== null) {
            console.log(2)
            ArticleList.push({
              "SousFamille": Article.SousFamilleSelected[0].text,
              "SousFamilleID": Article.SousFamilleSelected[0].key,
              "Beneficiaire": Article.BeneficiareSelected[0]?.text,
              "BeneficiaireID": Article.BeneficiareSelected[0]?.key,
              "DelaiLivraisionSouhaite": Article.numberOfDays,
              "comment": Article.Comment,
              "Prix": Article.price,
              "quantité": Article.quantity,
              "DescriptionTechnique": Article.ArticleSelected[0].text,
              "ArticleREF": Article.ArticleSelected[0].key,
              "ArticleFileName": Article.fileName,
              "Axe": Article.ArticleSelected[0].Axe,
              "BudgetAnnualAllocated": Article.ArticleSelected[0].BudgetAnnualAllocated,
              "BudgetAnnualRemaining": Article.ArticleSelected[0].BudgetAnnualRemaining,
              "BudgetAnnualUsed": Article.ArticleSelected[0].BudgetAnnualUsed,
              "LatestPurchasePrice": Article.ArticleSelected[0].LatestPurchasePrice,
              "ArticleFileData": {
                "name": Article.fileData.name,
                "size": Article.fileData.size,
                "type": Article.fileData.type,
                // "lastModified": Article.fileData.lastModified,
                // "lastModifiedDate": Article.fileData.lastModifiedDate,
                "webkitRelativePath": Article.fileData.webkitRelativePath,
              }
            });
          } else {
            ArticleList.push({
              "SousFamille": Article.SousFamilleSelected[0].text,
              "SousFamilleID": Article.SousFamilleSelected[0].key,
              "Beneficiaire": Article.BeneficiareSelected[0]?.text,
              "BeneficiaireID": Article.BeneficiareSelected[0]?.key,
              "DelaiLivraisionSouhaite": Article.numberOfDays,
              "comment": Article.Comment,
              "Prix": Article.price,
              "quantité": Article.quantity,
              "DescriptionTechnique": Article.ArticleSelected[0].text,
              "ArticleREF": Article.ArticleSelected[0].key,
              "ArticleFileName": "",
              "Axe": Article.ArticleSelected[0].Axe,
              "BudgetAnnualAllocated": Article.ArticleSelected[0].BudgetAnnualAllocated,
              "BudgetAnnualRemaining": Article.ArticleSelected[0].BudgetAnnualRemaining,
              "BudgetAnnualUsed": Article.ArticleSelected[0].BudgetAnnualUsed,
              "LatestPurchasePrice": Article.ArticleSelected[0].LatestPurchasePrice,
              "ArticleFileData": {}
            });
          }
        } else {
          if (Article.fileName !== null) {
            ArticleList.push({
              "SousFamille": Article.SousFamilleSelected[0].text,
              "SousFamilleID": Article.SousFamilleSelected[0].key,
              "Beneficiaire": this.state.CentreDeGestion,
              "BeneficiaireID": this.state.CentreDeGestion,
              "DelaiLivraisionSouhaite": Article.numberOfDays,
              "comment": Article.Comment,
              "Prix": Article.price,
              "quantité": Article.quantity,
              "DescriptionTechnique": Article.ArticleSelected[0].text,
              "ArticleREF": Article.ArticleSelected[0].key,
              "ArticleFileName": Article.fileName,
              "Axe": Article.ArticleSelected[0].Axe,
              "BudgetAnnualAllocated": Article.ArticleSelected[0].BudgetAnnualAllocated,
              "BudgetAnnualRemaining": Article.ArticleSelected[0].BudgetAnnualRemaining,
              "BudgetAnnualUsed": Article.ArticleSelected[0].BudgetAnnualUsed,
              "LatestPurchasePrice": Article.ArticleSelected[0].LatestPurchasePrice,
              "ArticleFileData": {
                "name": Article.fileData.name,
                "size": Article.fileData.size,
                "type": Article.fileData.type,
                // "lastModified": Article.fileData.lastModified,
                // "lastModifiedDate": Article.fileData.lastModifiedDate,
                "webkitRelativePath": Article.fileData.webkitRelativePath,
              }
            });
          } else {
            ArticleList.push({
              "SousFamille": Article.SousFamilleSelected[0].text,
              "SousFamilleID": Article.SousFamilleSelected[0].key,
              "Beneficiaire": this.state.CentreDeGestion,
              "BeneficiaireID": this.state.CentreDeGestion,
              "DelaiLivraisionSouhaite": Article.numberOfDays,
              "comment": Article.Comment,
              "Prix": Article.price,
              "quantité": Article.quantity,
              "DescriptionTechnique": Article.ArticleSelected[0].text,
              "ArticleREF": Article.ArticleSelected[0].key,
              "ArticleFileName": "",
              "Axe": Article.ArticleSelected[0].Axe,
              "BudgetAnnualAllocated": Article.ArticleSelected[0].BudgetAnnualAllocated,
              "BudgetAnnualRemaining": Article.ArticleSelected[0].BudgetAnnualRemaining,
              "BudgetAnnualUsed": Article.ArticleSelected[0].BudgetAnnualUsed,
              "LatestPurchasePrice": Article.ArticleSelected[0].LatestPurchasePrice,
              "ArticleFileData": {}
            });
          }
        }
      });

      console.log(ArticleList)
      var formData

      console.log(DemandeID);
      var Demande = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.filter(`DemandeID eq ${DemandeID}`).get();
      console.log(Demande);
      if (Demande[0].StatusApprobateurV1 === "A modifier") {
        console.log(1);
        var UserDisplayNameV1 = "";

        if (Demande[0].ApprobateurV1Id.length > 1) {
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
        } else {
          const user = await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV1Id[0]).get();
          UserDisplayNameV1 = user.Title;
        }

        formData = {
          "FamilleProduit": data[0].FamilleSelected[0].text,
          "FamilleProduitREF": data[0].FamilleSelected[0].key,
          "PrixTotal": prixTotal.toString(),
          "DelaiLivraisionSouhaite": data[0].numberOfDays,
          "Prix": "test ....",
          "Quantite": "test ....",
          "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
          "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
          "StatusDemande": "En cours de " + UserDisplayNameV1,
          "StatusDemandeV1": "En cours",
          "Produit": JSON.stringify(ArticleList),
        };
        console.log(formData)
        console.log(ArticleList)
        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).update(formData);

        if (ArticleList[0].ArticleFileName === "" && prevData[0].ArticleFileName === "") {
          // Nothing to de because we dont have an attachement file
        } else if (ArticleList[0].ArticleFileName === "" && prevData[0].ArticleFileName !== "") {

          // Delete the prev file
          await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).attachmentFiles.getByName(prevData[0].ArticleFileName).delete();
        } else if (ArticleList[0].ArticleFileName !== "" && prevData[0].ArticleFileName === "") {

          // ArticleList.map(async articleData => {
          //   await this.attachFileToItem(parseInt(DemandeID))
          // })
          await Promise.all(
            ArticleList.map(async articleData => {
              await this.attachFileToItem(parseInt(DemandeID))
            })
          );

        } else if (ArticleList[0].ArticleFileName !== "" && prevData[0].ArticleFileName !== "") {
          if (ArticleList[0].ArticleFileName !== prevData[0].ArticleFileName) {
            // Delete the prev attachement file
            await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).attachmentFiles.getByName(prevData[0].ArticleFileName).delete();

            // ArticleList.map(async articleData => {
            //   await this.attachFileToItem(parseInt(DemandeID))
            // })

            await Promise.all(
              ArticleList.map(async articleData => {
                await this.attachFileToItem(parseInt(DemandeID))
              })
            );


          }
        }

        console.log(updateDemandeAchat)
        // Save historique block
        const historyData = await Web(this.props.url)
          .lists.getByTitle("HistoriqueDemande")
          .items.filter(`DemandeID eq ${DemandeID}`)
          .get();

        if (historyData.length > 0) {
          var resultArray = JSON.parse(historyData[0].Actions);
          resultArray.push(
            "modifier par le demandeur a partir d'une demande de modification de la part de " +
            UserDisplayNameV1 + " le " + getCurrentDate()
          );
          resultArray.push(
            "En cours de l'approbation de " +
            UserDisplayNameV1 + " a partir de " + getCurrentDate()
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

        if (Demande[0].ApprobateurV2Id.length > 1) {
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
        } else {
          const user = await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV2Id[0]).get();
          UserDisplayNameV2 = user.Title;
        }

        formData = {
          "FamilleProduit": data[0].FamilleSelected[0].text,
          "FamilleProduitREF": data[0].FamilleSelected[0].key,
          "PrixTotal": prixTotal.toString(),
          "DelaiLivraisionSouhaite": data[0].numberOfDays,
          "Prix": "test ....",
          "Quantite": "test ....",
          "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
          "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
          "StatusDemande": "En cours de " + UserDisplayNameV2,
          "StatusDemandeV2": "En cours",
          "Produit": JSON.stringify(ArticleList),
        };
        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).update(formData);
        console.log(updateDemandeAchat)

        console.log(ArticleList[0].ArticleFileName, prevData[0].ArticleFileName)

        if (ArticleList[0].ArticleFileName === "" && prevData[0].ArticleFileName === "") {
          // Nothing to de because we dont have an attachement file
        } else if (ArticleList[0].ArticleFileName === "" && prevData[0].ArticleFileName !== "") {

          // Delete the prev file
          await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).attachmentFiles.getByName(prevData[0].ArticleFileName).delete();
        } else if (ArticleList[0].ArticleFileName !== "" && prevData[0].ArticleFileName === "") {

          // ArticleList.map(async articleData => {
          //   await this.attachFileToItem(parseInt(DemandeID))
          // })

          await Promise.all(
            ArticleList.map(async articleData => {
              await this.attachFileToItem(parseInt(DemandeID))
            })
          );
        } else if (ArticleList[0].ArticleFileName !== "" && prevData[0].ArticleFileName !== "") {

          // Delete the prev attachement file
          await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).attachmentFiles.getByName(prevData[0].ArticleFileName).delete();

          // ArticleList.map(async articleData => {
          //   await this.attachFileToItem(parseInt(DemandeID))
          // })

          await Promise.all(
            ArticleList.map(async articleData => {
              await this.attachFileToItem(parseInt(DemandeID))
            })
          );
        }

        // Save historique block
        const historyData = await Web(this.props.url)
          .lists.getByTitle("HistoriqueDemande")
          .items.filter(`DemandeID eq ${DemandeID}`)
          .get();

        if (historyData.length > 0) {
          var resultArray = JSON.parse(historyData[0].Actions);
          resultArray.push(
            "modifier par le demandeur a partir d'une demande de modification de la part de " + UserDisplayNameV2 + " le " + getCurrentDate()
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

        if (Demande[0].ApprobateurV3Id.length > 1) {
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
        } else {
          const user = await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV3Id[0]).get();
          UserDisplayNameV3 = user.Title;
        }
        formData = {
          "FamilleProduit": data[0].FamilleSelected[0].text,
          "FamilleProduitREF": data[0].FamilleSelected[0].key,
          "PrixTotal": prixTotal.toString(),
          "DelaiLivraisionSouhaite": data[0].numberOfDays,
          "Prix": "test ....",
          "Quantite": "test ....",
          "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
          "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
          "StatusDemande": "En cours de " + UserDisplayNameV3,
          "StatusDemandeV3": "En cours",
          "Produit": JSON.stringify(ArticleList),
        };
        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).update(formData);
        console.log(updateDemandeAchat)

        console.log(ArticleList[0].ArticleFileName, prevData[0].ArticleFileName)


        if (ArticleList[0].ArticleFileName === "" && prevData[0].ArticleFileName === "") {
          // Nothing to de because we dont have an attachement file
        } else if (ArticleList[0].ArticleFileName === "" && prevData[0].ArticleFileName !== "") {

          // Delete the prev file
          await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).attachmentFiles.getByName(prevData[0].ArticleFileName).delete();
        } else if (ArticleList[0].ArticleFileName !== "" && prevData[0].ArticleFileName === "") {

          // ArticleList.map(async articleData => {
          //   await this.attachFileToItem(parseInt(DemandeID))
          // })

          await Promise.all(
            ArticleList.map(async articleData => {
              await this.attachFileToItem(parseInt(DemandeID))
            })
          );
        } else if (ArticleList[0].ArticleFileName !== "" && prevData[0].ArticleFileName !== "") {

          // Delete the prev attachement file
          await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).attachmentFiles.getByName(prevData[0].ArticleFileName).delete();

          // ArticleList.map(async articleData => {
          //   await this.attachFileToItem(parseInt(DemandeID))
          // })

          await Promise.all(
            ArticleList.map(async articleData => {
              await this.attachFileToItem(parseInt(DemandeID))
            })
          );
        }

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
        console.log(Demande[0])
        if (Demande[0].ApprobateurV4Id.length > 1) {
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
        } else {
          const user = await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV4Id[0]).get();
          UserDisplayNameV4 = user.Title;
        }
        formData = {
          "FamilleProduit": data[0].FamilleSelected[0].text,
          "FamilleProduitREF": data[0].FamilleSelected[0].key,
          "PrixTotal": prixTotal.toString(),
          "DelaiLivraisionSouhaite": data[0].numberOfDays,
          "Prix": "test ....",
          "Quantite": "test ....",
          "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
          "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
          "StatusDemande": "En cours de " + UserDisplayNameV4,
          "StatusDemandeV4": "En cours",
          "Produit": JSON.stringify(ArticleList),
        };
        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).update(formData);
        console.log(updateDemandeAchat)

        console.log(ArticleList[0].ArticleFileName, prevData[0].ArticleFileName)

        if (ArticleList[0].ArticleFileName === "" && prevData[0].ArticleFileName === "") {
          // Nothing to de because we dont have an attachement file
        } else if (ArticleList[0].ArticleFileName === "" && prevData[0].ArticleFileName !== "") {

          // Delete the prev file
          await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).attachmentFiles.getByName(prevData[0].ArticleFileName).delete();
        } else if (ArticleList[0].ArticleFileName !== "" && prevData[0].ArticleFileName === "") {

          // ArticleList.map(async articleData => {
          //   await this.attachFileToItem(parseInt(DemandeID))
          // })

          await Promise.all(
            ArticleList.map(async articleData => {
              await this.attachFileToItem(parseInt(DemandeID))
            })
          );
        } else if (ArticleList[0].ArticleFileName !== "" && prevData[0].ArticleFileName !== "") {

          // Delete the prev attachement file
          await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).attachmentFiles.getByName(prevData[0].ArticleFileName).delete();

          // ArticleList.map(async articleData => {
          //   await this.attachFileToItem(parseInt(DemandeID))
          // })

          await Promise.all(
            ArticleList.map(async articleData => {
              await this.attachFileToItem(parseInt(DemandeID))
            })
          );
        }


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


  // Check if the current user in list of remplaçant if true get the list of demands of the other demander
  private checkRemplacantDemandes = async () => {
    try {
      const currentUserID: number = (await Web(this.props.url).currentUser.get()).Id;
      const now: string = new Date().toISOString(); // Format the current date to ISO 8601
      const remplacantTest = await Web(this.props.url).lists.getByTitle('RemplacantsModuleAchat').items
        .filter(`RemplacantId eq ${currentUserID} and DateDeDebut lt '${now}' and DateDeFin gt '${now}' and TypeRemplacement eq 'D'`)
        .orderBy('Created', false)
        .top(1)
        .select("Demandeur/Title", "Demandeur/EMail", "DemandeurId", "RemplacantId", "DateDeDebut", "DateDeFin")
        .expand("Demandeur")
        .get();

      console.log(remplacantTest);
      return remplacantTest;

    } catch (error) {
      console.error("Error checking remplacant demandes:", error);
      return [];
    }
  }


  private handleInputChange = (event: any, index: any) => {
    const inputValue = event.target.value;

    // Check if inputValue is a valid number
    if (!isNaN(inputValue) && inputValue !== '') {
      const updatedFormData = [...this.state.formData];
      updatedFormData[index - 1].numberOfDays = inputValue;

      this.setState({
        formData: updatedFormData
      });
    }
  }


  private getUserApprouvers = async (IdSubFamily, respCenter) => {
    const approuverList = await getApprouverList(IdSubFamily, respCenter)
    return approuverList
  }



  private async loadUserInfo() {
    try {
      console.log(this.props.context.pageContext.legacyPageContext["userPrincipalName"]);

      const user = await this._graphService.getUserId(this.props.context.pageContext.legacyPageContext["userPrincipalName"]);

      console.log(user);

      this.setState({
        userName: user["displayName"],
        userEmail: user["mail"],
        userRegistrationNumber: user["employeeId"],
        userEstablishment: user["companyName"],
        JobTitle: user["jobTitle"],
      });
    } catch (error) {
      console.error("Error loading user info:", error);
    }
  }


  private async loadRemplacantUserRemplacant(userPrincipalName) {
    try {
      console.log(userPrincipalName);

      const user = await this._graphService.getUserId(userPrincipalName);

      console.log(user);

      this.setState({
        RemplacantUserName: user["displayName"],
        RemplacantUserEmail: user["mail"],
        RemplacantUserRegistrationNumber: user["employeeId"],
        RemplacantUserEstablishment: user["companyName"],
        RemplacantJobTitle: user["jobTitle"],
      });
    } catch (error) {
      console.error("Error loading remplacant user info:", error);
    }
  }

  private getDemandeurAcces = async (userPrincipalName) => {
    const userInfo = await this._graphService.getUserId(userPrincipalName);
    const permissions = await getBenefList(userInfo["employeeId"]);
    if (permissions['Status'] !== "200") {
      return -1;
    } else return 0;
  }


  private checkUserPermissionsPerchaseModule = async (userPrincipalName) => {
    const userInfo = await this._graphService.getUserId(userPrincipalName)
    const permissions = await getBenefList(userInfo["employeeId"])
    console.log(permissions['StatusAll'])
    if (permissions['Status'] !== "200") {
      window.location.href = REDIRECTION_URL;
    } else {
      if (permissions['StatusAll'] === "True") {
        this.setState({ DisabledBenef: false })
      } else {
        this.setState({ DisabledBenef: true })
      }
    }
  }



  public async getUserByEmail(userDisplayName) {
    try {
      const userEmailMSgraph = await this._graphService.getUserEmailByDisplayName(userDisplayName)
      const user = await Web(this.props.url).ensureUser(userEmailMSgraph);
      return user.data.Id;
    } catch (error) {
      throw error; // Re-throw the error
    }
  }


  private checkApprouverRemplacant = async (Approuver1, Approuver2, Approuver3, Approuver4) => {
    try {
      if (Approuver3 !== null) {
        const now: string = new Date().toISOString(); // Format the current date to ISO 8601
        const remplacantTest = await Web(this.props.url).lists.getByTitle('RemplacantsModuleAchat').items
          .filter(`DemandeurId eq ${Approuver1} or DemandeurId eq ${Approuver2} DemandeurId eq ${Approuver3} or DemandeurId eq ${Approuver4} and DateDeDebut lt '${now}' and DateDeFin gt '${now}' and TypeRemplacement eq 'AP'`)
          .orderBy('Created', false)
          .top(1)
          .select("Demandeur/Title", "Demandeur/EMail", "DemandeurId", "RemplacantId", "DateDeDebut", "DateDeFin")
          .expand("Demandeur")
          .get();

        console.log(remplacantTest);
        return remplacantTest;
      } else {
        const now: string = new Date().toISOString(); // Format the current date to ISO 8601
        const remplacantTest = await Web(this.props.url).lists.getByTitle('RemplacantsModuleAchat').items
          .filter(`DemandeurId eq ${Approuver1} or DemandeurId eq ${Approuver2} or DemandeurId eq ${Approuver4} and DateDeDebut lt '${now}' and DateDeFin gt '${now}' and TypeRemplacement eq 'AP'`)
          .orderBy('Created', false)
          .top(1)
          .select("Demandeur/Title", "Demandeur/EMail", "DemandeurId", "RemplacantId", "DateDeDebut", "DateDeFin")
          .expand("Demandeur")
          .get();
        return remplacantTest;
      }


    } catch (error) {
      console.error("Error checking remplacant demandes:", error);
      return [];
    }
  }

  async componentDidMount() {
    this.loadUserInfo();
    await this.getCurrentDemandeInfo();


    // Get all famille demande
    const listFamilleProduit = [];
    const familyProducts = await getFamily();
    familyProducts.Families.map(famille => {
      listFamilleProduit.push({
        key: famille.IdFamily,
        text: famille.DescFamily,
      })
    })
    this.setState({ familyProducts: listFamilleProduit })

    // Get all subFamily of demande
    await this.getSubFamilyData(this.state.FamilleID)

    // Get All Articles in each article
    const demandeID = this.getCurrentIDfromURL()
    const demandeData = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(demandeID)).get()
    var listProduits = JSON.parse(demandeData.Produit)

    listProduits.map(async (produit, index) => {
      const updatedFormData = [...this.state.formData];
      console.log(produit)
      const items = await getProduct(produit.SousFamilleID, produit.Beneficiaire);
      console.log(items)
      const listArticles = items.Items.map(item => ({
        key: item.RefItem,
        LatestPurchasePrice: item.LatestPurchasePrice,
        text: item.DesignationItem,
        BudgetAnnualUsed: item.BudgetAnnualUsed,
        BudgetAnnualRemaining: item.BudgetAnnualRemaining,
        BudgetAnnualAllocated: item.BudgetAnnualAllocated,
        Axe: item.Axe,
      }));
      updatedFormData[index].AllArticleData = listArticles

      this.setState({
        formData: updatedFormData,
      });
    })
  }

  public render(): React.ReactElement<IUpdateDemandeAchatProps> {

    const dropdownStyles: Partial<IDropdownStyles> = {
      title: { backgroundColor: "white" },
    };

    const controlClass = mergeStyleSets({
      TextField: { backgroundColor: "white", }
    });

    const dropdownStylesFamilleDropdown: Partial<IDropdownStyles> = {
      callout: { minWidth: 300, maxwidth: 600 }, //Fix #2 alternative
      title: { backgroundColor: "white" },
    };

    const disabledSubmit = this.disabledSubmitButton();

    // Created but not implemented
    var AllArticleData = getAllArticles(this.state.formData)
    const uniqueArray = removeDuplicates2(AllArticleData);
    console.log(uniqueArray);


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
              <div>
                {(this.state.counterProducts > 1) && (index !== 1) &&
                  <p className={stylescustom.indique}>
                    <button style={{ float: "right" }} className={stylescustom.btn} onClick={() => this.deleteArticle(index - 1)}>-</button>
                  </p>
                }
                <div className='productsDiv'>
                  <div className={stylescustom.row}>
                    {!this.state.DisabledBenef && <div className={stylescustom.data}>
                      <p className={stylescustom.title}>Bénificaire / Déstinataire</p>
                      <Dropdown
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
                    </div>}


                    <div className={stylescustom.data}>
                      <p className={stylescustom.title}>* Famille</p>
                      {index > 1 ? (
                        <label className={stylescustom.btn} style={{ width: '180px' }}>{this.state.formData[0].FamilleSelected[0].text}</label>
                      ) : (
                        <Dropdown
                          defaultValue={this.state.formData[index - 1]?.FamilleSelected?.[0]?.key || ""}
                          styles={dropdownStylesFamilleDropdown}
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
                        defaultSelectedKey={this.state.formData[index - 1]['SousFamilleSelected'] && this.state.formData[index - 1]['SousFamilleSelected'][0] ? this.state.formData[index - 1]['SousFamilleSelected'][0].key : ""}
                        styles={dropdownStyles}
                        onRenderTitle={this.onRenderTitle}
                        onRenderOption={this.onRenderOption}
                        onRenderCaretDown={this.onRenderCaretDown}
                        options={this.state.subFamilyProducts}
                        onChanged={(value) => this.handleChangeSousFamilleDropdown(value, index)}
                        style={{ width: '200px' }}
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
                        options={this.state.formData[index - 1].AllArticleData}
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
                        value={this.state.formData[index - 1]["quantity"] && this.state.formData[index - 1]["quantity"] ? this.state.formData[index - 1]["quantity"] : ""}
                      />
                    </div>

                    <div className={stylescustom.data}>
                      <p className={stylescustom.title}>* prix unitaire estimatif :</p>
                      <TextField
                        type='number'
                        min={0.1}
                        step="0.1" // Allows float values
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
                </div>
                <br></br>
                {this.state.counterProducts > 1 && <div className={stylescustom.line}></div>}
              </div>
            )}

            {
              !this.state.DisabledBenef
                ? this.state.formData.map((article, index) => {
                  if (article.ArticleSelected.length > 0 && article) {
                    if (parseFloat(article.price) * parseInt(article.quantity) > convertStringToNumber(article.ArticleSelected[0].BudgetAnnualRemaining)) {
                      return (
                        <p key={index} className={stylescustom.indique}>
                          - <b style={{ color: "#7d2935" }}>Prévenez</b>, le coût de l'article {article.ArticleSelected[0].text} pour le bénéficiaire {article.BeneficiareSelected[0].text} de votre demande dépasse la limite budgétaire fixée.
                        </p>
                      );
                    }
                  }
                  return null;
                })
                : this.state.formData.map((article, index) => {
                  if (article.ArticleSelected.length > 0 && article) {
                    if (parseFloat(article.price) * parseInt(article.quantity) > convertStringToNumber(article.ArticleSelected[0].BudgetAnnualRemaining)) {
                      return (
                        <div key={index}>
                          <p className={stylescustom.indique}>
                            - <b style={{ color: "#7d2935" }}>Prévenez</b>, le coût de l'article {article.ArticleSelected[0].text} de votre demande dépasse la limite budgétaire fixée.
                          </p>
                        </div>
                      );
                    }
                  }
                  return null;
                })
            }

            <div className={stylescustom.row}>
              <div className={stylescustom.data}>
                <p className={stylescustom.title}> Piéce jointe :</p>
                <label htmlFor="uploadFile" className={stylescustom.btn}>Choisir un élément</label>
                <input type="file" id="uploadFile" style={{ display: 'none' }}
                  accept=".jpg, .jpeg, .png , .pdf , .doc ,.docx"
                  onChange={(e) => {
                    this.addFile(e);
                    this.setState({ errors: { ...this.state.errors, file: "" } });
                  }}
                />
                {this.state.formData[0].fileData && <span style={{ marginLeft: 10, fontSize: 16, whiteSpace: "pre" }}>{this.state.formData[0].fileName} <span style={{ cursor: 'pointer' }} onClick={() => { this.initImage(1); }}>&#10006;</span></span>}
                <span style={{ color: "rgb(168, 0, 0)", fontSize: 12, fontWeight: 400, display: 'block' }}>
                  {this.state.errors.file !== "" ? this.state.errors.file : ""}
                </span>
              </div>
            </div>


            <table className={stylescustom.ad}>
              <thead>
                <th className={stylescustom.title} >Autres détails</th>
              </thead>
              <tbody className={stylescustom.tbody}>
                {console.log(this.state.formData)}
                {console.log(this.state.DisabledBenef)}
                {(this.state.DisabledBenef === false) && this.state.formData.map((article, index) =>
                  article.ArticleSelected.length > 0 && article &&
                  <>
                    {console.log("Axe data:", this.state.axePerBuget)}
                    <tr>
                      <td className={stylescustom.key}>Le budget de l'article: </td>
                      <td className={stylescustom.value}>{article.ArticleSelected.length > 0 && article.ArticleSelected[0].text}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Le montant du budget annuel alloué</td>
                      <td className={stylescustom.value}>{article.ArticleSelected.length > 0 && article.ArticleSelected[0].BudgetAnnualAllocated}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Le montant du budget annuel restant</td>
                      <td className={stylescustom.value}>{article.ArticleSelected.length > 0 && article.ArticleSelected[0].BudgetAnnualRemaining}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Le montant du budget annuel utilisé</td>
                      <td className={stylescustom.value}>{article.ArticleSelected.length > 0 && article.ArticleSelected[0].BudgetAnnualUsed}</td>
                    </tr>
                  </>
                )}
                {(this.state.DisabledBenef === true) && uniqueArray.map((article, index) =>
                  <>
                    {console.log(article)}
                    <tr>
                      <td className={stylescustom.key}>Le budget de l'article: </td>
                      <td className={stylescustom.value}>{article.text}</td>
                    </tr>
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


            {this.state.checkActionCurrentUser &&
              <div className={stylescustom.btncont}>
                <button disabled={disabledSubmit} className={stylescustom.btn} onClick={() => this.addArticle()}>AJOUTER UN ARTICLE</button>
                <button disabled={disabledSubmit} className={stylescustom.btn} onClick={() => this.submitFormData()}>soumettre la demande</button>
              </div>
            }


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


            <SweetAlert2
              allowOutsideClick={false}
              show={this.state.showPopUpApprouver4}
              title="Demande des Articles"
              text="Désole Mr/Mme vous n'avez le droit de créer des demandes d'achat car vous étes un Controlleur de gestion"
              imageUrl={img}
              confirmButtonColor='#7D2935'
              onConfirm={() => window.open(this.props.url + "/SitePages/DashboardDemandeur.aspx", "_self")}
              imageWidth="150"
              imageHeight="150"
            />
          </div>



          {this.state.spinnerShow &&
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <div className={styles.paginations} style={{ textAlign: 'center', paddingTop: "30%" }}>
                  {this.state.spinnerShow && <span className={styles.loader}></span>}
                </div>
              </div>
            </div>
          }
        </div>

      </Fabric>
    );
  }
}
