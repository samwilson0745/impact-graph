import { Boxes, Database, Plug, Rss, Users } from 'lucide-react';
import { StatTile } from '@/components/dashboard/stat-tile';
import { TierDot } from '@/components/shared/tier-dot';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { DATABASE_TYPE_LABELS } from '@/lib/graph-theme';
import type { BlastRadiusResult } from '@/types/api';

function summarySentence(result: BlastRadiusResult): string {
  const { service, affectedServices, teams, kafkaTopics, databases, apis } = result;
  const serviceCount = affectedServices.length;
  const teamCount = teams.length;

  if (serviceCount === 0) {
    return `Deploying ${service.name} has no downstream callers within ${result.maxHops} hop${result.maxHops === 1 ? '' : 's'} — it's isolated from the rest of the call graph at this depth.`;
  }

  return `Deploying ${service.name} affects ${serviceCount} other service${serviceCount === 1 ? '' : 's'} across ${teamCount} team${teamCount === 1 ? '' : 's'}, touching ${apis.length} API${apis.length === 1 ? '' : 's'}, ${kafkaTopics.length} Kafka topic${kafkaTopics.length === 1 ? '' : 's'}, and ${databases.length} database${databases.length === 1 ? '' : 's'}.`;
}

export function ImpactSummary({ result }: { result: BlastRadiusResult }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed">{summarySentence(result)}</p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <StatTile
          icon={Boxes}
          label="Services affected"
          value={result.affectedServices.length}
          accentClassName="bg-slate-500/10 text-slate-600 dark:text-slate-300"
        />
        <StatTile
          icon={Plug}
          label="APIs affected"
          value={result.apis.length}
          accentClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatTile
          icon={Rss}
          label="Kafka topics"
          value={result.kafkaTopics.length}
          accentClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        />
        <StatTile
          icon={Database}
          label="Databases touched"
          value={result.databases.length}
          accentClassName="bg-teal-500/10 text-teal-600 dark:text-teal-400"
        />
        <StatTile
          icon={Users}
          label="Teams to notify"
          value={result.teams.length}
          accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>

      <Accordion multiple defaultValue={['teams']} className="w-full">
        <AccordionItem value="teams">
          <AccordionTrigger className="text-sm">Teams to notify ({result.teams.length})</AccordionTrigger>
          <AccordionContent>
            {result.teams.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other teams own services in this blast radius.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {result.teams.map((team) => (
                  <li key={team.id} className="flex items-center justify-between text-sm">
                    <span>{team.name}</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {team.slack_channel}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="services">
          <AccordionTrigger className="text-sm">
            Affected services ({result.affectedServices.length})
          </AccordionTrigger>
          <AccordionContent>
            <ul className="flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-1">
              {result.affectedServices.map((svc) => (
                <li key={svc.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <TierDot tier={svc.tier} />
                    {svc.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {svc.hop} hop{svc.hop === 1 ? '' : 's'}
                  </span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="topics">
          <AccordionTrigger className="text-sm">Kafka topics ({result.kafkaTopics.length})</AccordionTrigger>
          <AccordionContent>
            <ul className="flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-1">
              {result.kafkaTopics.map((topic) => (
                <li key={topic.id} className="flex items-center justify-between text-sm">
                  <span>{topic.name}</span>
                  <span className="flex gap-1">
                    {topic.publishers.length > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        {topic.publishers.length} publisher{topic.publishers.length === 1 ? '' : 's'}
                      </Badge>
                    )}
                    {topic.consumers.length > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        {topic.consumers.length} consumer{topic.consumers.length === 1 ? '' : 's'}
                      </Badge>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="databases">
          <AccordionTrigger className="text-sm">Databases ({result.databases.length})</AccordionTrigger>
          <AccordionContent>
            <ul className="flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-1">
              {result.databases.map((db) => (
                <li key={db.id} className="flex items-center justify-between text-sm">
                  <span>{db.name}</span>
                  <span className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px]">
                      {DATABASE_TYPE_LABELS[db.type]}
                    </Badge>
                    {db.writers.length > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        {db.writers.length} writer{db.writers.length === 1 ? '' : 's'}
                      </Badge>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
