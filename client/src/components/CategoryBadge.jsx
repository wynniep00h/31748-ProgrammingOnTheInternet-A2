import { getCategoryColor, getCategoryIcon } from "../constants.js";


export default function CategoryBadge({ category }) {
    const color = getCategoryColor(category);
    const icon = getCategoryIcon(category);

    return (
        <span
        className="category-badge"
        style={{ background: color + "22", color: '#000000'}}
        >
            <span className="category-dot" style={{background: color}} />
            <img src={icon} alt={category} width={60} height={60} style={{ objectFit: "contain" }} />
            {category}
        </span>
    );
}