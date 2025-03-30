
import { Link } from "react-router-dom";

interface IssueCardProps {
  icon: string;
  title: string;
  description: string;
  path?: string;
}

const IssueCard = ({ icon, title, description, path = "/report" }: IssueCardProps) => {
  return (
    <Link to={path} className="block">
      <div className="issue-card">
        <div className="issue-icon">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
};

export default IssueCard;
