import type { Standing } from "@/lib/football";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type StandingsTableProps = {
  standings: Standing[];
};

export default function StandingsTable({ standings }: StandingsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>La Liga Standings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-right">P</TableHead>
              <TableHead className="text-right">GD</TableHead>
              <TableHead className="text-right">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((club) => {
              const gd = club.goalsFor - club.goalsAgainst;

              return (
                <TableRow key={club.team}>
                  <TableCell className="font-medium">{club.position}</TableCell>
                  <TableCell>{club.team}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{club.played}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{gd > 0 ? `+${gd}` : gd}</TableCell>
                  <TableCell className="text-right font-semibold">{club.points}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
