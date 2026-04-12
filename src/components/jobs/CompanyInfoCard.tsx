import { Building } from "lucide-react";

interface CompanyInfoCardProps {
  company: {
    name: string;
    size: string;
    industry: string;
    founded: string;
    website: string;
    logoUrl?: string;
  };
}

const fallbackCompanyData = (value: any) => {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }
    return value;
};

export const CompanyInfoCard = ({ company }: CompanyInfoCardProps) => {
  return (
    <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm mb-8 border border-surface-container">
        <h4 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Company Info
        </h4>
        
        <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container-low flex items-center justify-center border border-outline-variant/30 flex-shrink-0">
                {company.logoUrl ? (
                   <img src={company.logoUrl} alt={`${company.name} logo`} className="w-full h-full object-cover" />
                ) : (
                   <Building className="h-6 w-6 text-outline" />
                )}
            </div>
            <div className="overflow-hidden">
                <p className="font-headline font-bold text-on-surface truncate" title={company.name}>{fallbackCompanyData(company.name)}</p>
                {company.website && company.website !== "#" ? (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary font-medium hover:underline truncate block">
                        {company.website.replace(/^https?:\/\//, '')}
                    </a>
                ) : (
                     <p className="text-sm text-on-surface-variant">No website provided</p>
                )}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
                <p className="text-xs text-on-surface-variant font-label uppercase tracking-wider mb-1">Size</p>
                <p className="text-sm font-semibold text-on-surface">{fallbackCompanyData(company.size)}</p>
            </div>
            <div>
                <p className="text-xs text-on-surface-variant font-label uppercase tracking-wider mb-1">Industry</p>
                <p className="text-sm font-semibold text-on-surface">{fallbackCompanyData(company.industry)}</p>
            </div>
            <div className="col-span-2">
                <p className="text-xs text-on-surface-variant font-label uppercase tracking-wider mb-1">Founded</p>
                <p className="text-sm font-semibold text-on-surface">{fallbackCompanyData(company.founded)}</p>
            </div>
        </div>
    </div>
  );
};
