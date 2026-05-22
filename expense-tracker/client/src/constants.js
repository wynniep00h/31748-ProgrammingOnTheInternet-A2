// shared data: add or change categories. 
import foodIcon from "./assets/icons/food.png";
import housingIcon from "./assets/icons/housing.png";
import transportIcon from "./assets/icons/publictransport.png";
import shoppingIcon from "./assets/icons/shopping.png";
import entertainmentIcon from "./assets/icons/entertainment.png";
import healthIcon from "./assets/icons/health.png";
import educationIcon from "./assets/icons/education.png";
import utilitiesIcon from "./assets/icons/utilities.png";
import giftsIcon from "./assets/icons/gifts.png";
import otherIcon from "./assets/icons/other.png";



export const CATEGORIES = [
    "Food & Dining",
    "Transport",
    "Shopping",
    "Entertainment",
    "Health",
    "Education",
    "Housing",
    "Utilities",
    "Gifts", 
    "Other",
];

const CATEGORY_COLORS = { 
    "Food & Dining": "#f1839b",
    "Transport": "#36A2EB",
    "Shopping": "#ecad0c",
    "Entertainment": "#4BC0C0",
    "Health": "#9966FF",
    "Education": "#ca833b",
    "Housing": "#5f7fbe",
    "Utilities": "#633c72",
    "Gifts": "#36A2EB",
    "Other": "#FFCE56",
};

const CATEGORY_ICONS = { 
    "Food & Dining": foodIcon,
    "Transport": transportIcon,
    "Shopping": shoppingIcon,
    "Entertainment": entertainmentIcon,
    "Health": healthIcon,
    "Education": educationIcon,
    "Housing": housingIcon,
    "Utilities": utilitiesIcon,
    "Gifts": giftsIcon,
    "Other": otherIcon,
};

export const getCategoryColor = (category) => CATEGORY_COLORS[category] || "#000000";
export const getCategoryIcon = (category) => CATEGORY_ICONS[category] || foodIcon;

export const formatCurrency = (n) => 
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(n);

export const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });

export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
