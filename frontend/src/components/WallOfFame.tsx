import React from 'react';
import { Window } from './RetroUI';
import { Github, Twitter, Star, Heart, Users } from 'lucide-react';

interface Collaborator {
  name: string;
  role: string;
  avatar?: string;
  github?: string;
  twitter?: string;
}

const collaborators: Collaborator[] = [
  {
    name: 'Frani',
    role: 'Creador & Mantenedor',
    github: 'frani',
    twitter: 'franivsky',
  },
  // Add more collaborators here as the project grows
];

const CollaboratorCard: React.FC<{ collab: Collaborator; index: number }> = ({ collab, index }) => {
  const pastelColors = [
    'bg-pastel-pink/60',
    'bg-pastel-blue/60',
    'bg-pastel-green/60',
    'bg-pastel-yellow/60',
    'bg-pastel-purple/60',
  ];
  const borderColors = [
    'border-pink-400',
    'border-blue-400',
    'border-green-400',
    'border-yellow-400',
    'border-purple-400',
  ];
  const color = pastelColors[index % pastelColors.length];
  const border = borderColors[index % borderColors.length];

  return (
    <div className={`${color} border-2 ${border} shadow-button p-4 flex flex-col items-center gap-3 group hover:scale-[1.02] transition-all duration-200`}>
      {/* Avatar */}
      <div className="w-16 h-16 border-2 border-black shadow-button bg-white flex items-center justify-center overflow-hidden">
        {collab.github ? (
          <img 
            src={`https://github.com/${collab.github}.png?size=64`} 
            alt={collab.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <span className={`text-2xl font-black text-retro-blue ${collab.github ? 'hidden' : ''}`}>
          {collab.name.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="text-center">
        <h3 className="font-black text-sm uppercase tracking-wide">{collab.name}</h3>
        <p className="text-[10px] font-bold opacity-60 mt-0.5">{collab.role}</p>
      </div>

      {/* Star badge for creator */}
      {index === 0 && (
        <div className="flex items-center gap-1 bg-yellow-300 border border-black px-2 py-0.5 shadow-[1px_1px_0px_black]">
          <Star className="w-3 h-3 fill-yellow-600 text-yellow-600" />
          <span className="text-[9px] font-black uppercase">Fundador</span>
        </div>
      )}

      {/* Social Links */}
      <div className="flex gap-2 mt-1">
        {collab.github && (
          <a
            href={`https://github.com/${collab.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-retro-bg border-2 border-black shadow-button px-2 py-1 text-[10px] font-bold hover:bg-gray-300 active:shadow-button-pressed transition-colors"
            title={`GitHub: @${collab.github}`}
          >
            <Github className="w-3 h-3" />
            <span>@{collab.github}</span>
          </a>
        )}
        {collab.twitter && (
          <a
            href={`https://x.com/${collab.twitter}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-retro-bg border-2 border-black shadow-button px-2 py-1 text-[10px] font-bold hover:bg-blue-100 active:shadow-button-pressed transition-colors"
            title={`Twitter: @${collab.twitter}`}
          >
            <Twitter className="w-3 h-3" />
            <span>@{collab.twitter}</span>
          </a>
        )}
      </div>
    </div>
  );
};

export const WallOfFame: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-4 animate-in fade-in duration-500">
      <Window title={
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>Wall of Fame — Colaboradores</span>
        </div>
      } className="bg-pastel-purple h-full">
        <div className="p-4 md:p-8 flex flex-col items-center gap-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                Wall of Fame
              </h2>
              <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
            </div>
            <p className="text-sm font-bold opacity-70 max-w-md">
              Las personas increíbles que hacen posible este proyecto open-source 🇦🇷
            </p>
          </div>

          {/* Collaborators Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl">
            {collaborators.map((collab, index) => (
              <CollaboratorCard key={collab.name} collab={collab} index={index} />
            ))}
          </div>

          {/* Call to action */}
          <div className="mt-4 text-center bg-white/80 border-2 border-black shadow-button p-4 max-w-md w-full">
            <p className="text-xs font-bold mb-3">
              ¿Querés aparecer acá? ¡Contribuí al proyecto!
            </p>
            <a
              href="https://github.com/frani/argentino"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-retro-blue text-white border-2 border-black shadow-button px-4 py-2 text-xs font-black uppercase hover:bg-blue-900 active:shadow-button-pressed transition-colors"
            >
              <Github className="w-4 h-4" />
              Contribuir en GitHub
            </a>
          </div>
        </div>
      </Window>
    </div>
  );
};
