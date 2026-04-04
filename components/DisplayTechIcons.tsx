import Image from "next/image";

import { cn, getTechLogos } from "@/lib/utils";

const DisplayTechIcons = async ({ techStack }: TechIconProps) => {
  const techIcons = await getTechLogos(techStack);

  return (
    <div className="flex flex-row">
      {techIcons.slice(0, 3).map(({ tech, url }, index) => (
        <div
          key={tech}
          className={cn(
            "relative group/tech bg-slate-100 border border-border rounded-full p-2 flex flex-center transition-all hover:z-20",
            index >= 1 && "-ml-3"
          )}
        >
          <span className="tech-tooltip left-1/2 -translate-x-1/2 opacity-0 group-hover/tech:opacity-100 group-hover/tech:flex transition-opacity z-50 pointer-events-none">
            {tech}
          </span>
 
          <Image
            src={url}
            alt={tech}
            width={100}
            height={100}
            className="size-5"
          />
        </div>
      ))}
    </div>
  );
};

export default DisplayTechIcons;
