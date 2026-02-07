import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Plus, MoreHorizontal, Pencil, Trash2, Users, UserPlus, Phone, Mail, Award } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  team_type: string;
  description: string | null;
  color: string;
  is_active: boolean;
}

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  certifications: string[];
  hourly_rate: number | null;
  is_active: boolean;
  notes: string | null;
}

interface TeamAssignment {
  id: string;
  team_id: string;
  member_id: string;
  is_lead: boolean;
  member?: TeamMember;
}

export default function Teams() {
  const queryClient = useQueryClient();
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [assigningToTeam, setAssigningToTeam] = useState<Team | null>(null);

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['crm_teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_teams')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Team[];
    }
  });

  const { data: members = [] } = useQuery({
    queryKey: ['crm_team_members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_team_members')
        .select('*')
        .eq('is_active', true)
        .order('first_name');
      if (error) throw error;
      return data as TeamMember[];
    }
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['crm_team_assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_team_assignments')
        .select('*, member:crm_team_members(*)');
      if (error) throw error;
      return data as TeamAssignment[];
    }
  });

  const saveTeamMutation = useMutation({
    mutationFn: async (teamData: Partial<Team>) => {
      if (editingTeam?.id) {
        const { error } = await supabase
          .from('crm_teams')
          .update(teamData)
          .eq('id', editingTeam.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('crm_teams').insert(teamData as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_teams'] });
      setIsTeamDialogOpen(false);
      setEditingTeam(null);
      toast.success(editingTeam ? 'Team updated' : 'Team created');
    },
    onError: (error) => toast.error('Failed to save team: ' + error.message)
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('crm_teams').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_teams'] });
      toast.success('Team deleted');
    },
    onError: (error) => toast.error('Failed to delete: ' + error.message)
  });

  const saveMemberMutation = useMutation({
    mutationFn: async (memberData: Partial<TeamMember>) => {
      if (editingMember?.id) {
        const { error } = await supabase
          .from('crm_team_members')
          .update(memberData)
          .eq('id', editingMember.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('crm_team_members').insert(memberData as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_team_members'] });
      setIsMemberDialogOpen(false);
      setEditingMember(null);
      toast.success(editingMember ? 'Member updated' : 'Member added');
    },
    onError: (error) => toast.error('Failed to save member: ' + error.message)
  });

  const assignMemberMutation = useMutation({
    mutationFn: async ({ teamId, memberId, isLead }: { teamId: string; memberId: string; isLead: boolean }) => {
      const { error } = await supabase
        .from('crm_team_assignments')
        .insert({ team_id: teamId, member_id: memberId, is_lead: isLead });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_team_assignments'] });
      setIsAssignDialogOpen(false);
      setAssigningToTeam(null);
      toast.success('Member assigned to team');
    },
    onError: (error) => toast.error('Failed to assign member: ' + error.message)
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase.from('crm_team_assignments').delete().eq('id', assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_team_assignments'] });
      toast.success('Member removed from team');
    }
  });

  const getTeamMembers = (teamId: string) => {
    return assignments.filter(a => a.team_id === teamId);
  };

  const getUnassignedMembers = (teamId: string) => {
    const assignedIds = assignments.filter(a => a.team_id === teamId).map(a => a.member_id);
    return members.filter(m => !assignedIds.includes(m.id));
  };

  const teamTypeColors: Record<string, string> = {
    install: 'bg-green-500/10 text-green-600',
    service: 'bg-blue-500/10 text-blue-600',
    sales: 'bg-purple-500/10 text-purple-600',
    subcontractor: 'bg-orange-500/10 text-orange-600'
  };

  return (
    <AdminLayout title="Teams & Crew">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Teams & Crew</h1>
            <p className="text-muted-foreground">Manage technicians, install teams, and subcontractors</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setEditingMember(null)}>
                  <UserPlus className="h-4 w-4 mr-2" /> Add Team Member
                </Button>
              </DialogTrigger>
              <MemberDialog
                editingMember={editingMember}
                onSave={(data) => saveMemberMutation.mutate(data)}
                isLoading={saveMemberMutation.isPending}
              />
            </Dialog>
            <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingTeam(null)}>
                  <Plus className="h-4 w-4 mr-2" /> New Team
                </Button>
              </DialogTrigger>
              <TeamDialog
                editingTeam={editingTeam}
                onSave={(data) => saveTeamMutation.mutate(data)}
                isLoading={saveTeamMutation.isPending}
              />
            </Dialog>
          </div>
        </div>

        {/* Teams Grid */}
        {teamsLoading ? (
          <p className="text-muted-foreground">Loading teams...</p>
        ) : teams.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Teams Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first team to organize your crew</p>
              <Button onClick={() => setIsTeamDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Create Team
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map(team => {
              const teamMembers = getTeamMembers(team.id);
              return (
                <Card key={team.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                        </div>
                        <Badge className={teamTypeColors[team.team_type] || ''}>
                          {team.team_type}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingTeam(team); setIsTeamDialogOpen(true); }}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit Team
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setAssigningToTeam(team); setIsAssignDialogOpen(true); }}>
                            <UserPlus className="h-4 w-4 mr-2" /> Add Member
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteTeamMutation.mutate(team.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {team.description && (
                      <CardDescription>{team.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {teamMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No members assigned
                        </p>
                      ) : (
                        teamMembers.map(assignment => {
                          const member = assignment.member;
                          if (!member) return null;
                          return (
                            <div
                              key={assignment.id}
                              className="flex items-center gap-3 p-2 rounded-lg bg-accent/50"
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                {member.first_name[0]}{member.last_name?.[0] || ''}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    {member.first_name} {member.last_name}
                                  </span>
                                  {assignment.is_lead && (
                                    <Badge variant="secondary" className="text-xs">Lead</Badge>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground capitalize">{member.role}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => removeAssignmentMutation.mutate(assignment.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* All Team Members Section */}
        <Card>
          <CardHeader>
            <CardTitle>All Team Members</CardTitle>
            <CardDescription>Individual technicians and crew members</CardDescription>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No team members added yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map(member => (
                  <div
                    key={member.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {member.first_name[0]}{member.last_name?.[0] || ''}
                        </div>
                        <div>
                          <h4 className="font-medium">{member.first_name} {member.last_name}</h4>
                          <Badge variant="outline" className="text-xs capitalize">{member.role}</Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingMember(member); setIsMemberDialogOpen(true); }}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" /> {member.phone}
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" /> {member.email}
                        </div>
                      )}
                      {member.certifications && member.certifications.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap mt-2">
                          <Award className="h-3 w-3" />
                          {member.certifications.map(cert => (
                            <Badge key={cert} variant="secondary" className="text-xs">{cert}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assign Member Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Member to {assigningToTeam?.name}</DialogTitle>
            </DialogHeader>
            {assigningToTeam && (
              <AssignMemberForm
                teamId={assigningToTeam.id}
                availableMembers={getUnassignedMembers(assigningToTeam.id)}
                onAssign={(memberId, isLead) => assignMemberMutation.mutate({ 
                  teamId: assigningToTeam.id, 
                  memberId, 
                  isLead 
                })}
                isLoading={assignMemberMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

function TeamDialog({ 
  editingTeam, 
  onSave, 
  isLoading 
}: { 
  editingTeam: Team | null; 
  onSave: (data: Partial<Team>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Team>>(
    editingTeam || {
      name: '',
      team_type: 'install',
      description: '',
      color: '#10B981',
      is_active: true
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{editingTeam ? 'Edit Team' : 'New Team'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Team Name</Label>
          <Input
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Install Crew A"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Team Type</Label>
            <Select
              value={formData.team_type}
              onValueChange={(v) => setFormData({ ...formData, team_type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="install">Install</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="subcontractor">Subcontractor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <Input
              type="color"
              value={formData.color || '#10B981'}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional team description"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Team'}
        </Button>
      </form>
    </DialogContent>
  );
}

function MemberDialog({ 
  editingMember, 
  onSave, 
  isLoading 
}: { 
  editingMember: TeamMember | null; 
  onSave: (data: Partial<TeamMember>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<TeamMember>>(
    editingMember || {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'technician',
      certifications: [],
      hourly_rate: null,
      is_active: true,
      notes: ''
    }
  );
  const [certInput, setCertInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addCert = () => {
    if (certInput.trim()) {
      setFormData({
        ...formData,
        certifications: [...(formData.certifications || []), certInput.trim()]
      });
      setCertInput('');
    }
  };

  const removeCert = (cert: string) => {
    setFormData({
      ...formData,
      certifications: (formData.certifications || []).filter(c => c !== cert)
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input
              value={formData.first_name || ''}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input
              value={formData.last_name || ''}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={formData.role}
              onValueChange={(v) => setFormData({ ...formData, role: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="technician">Technician</SelectItem>
                <SelectItem value="apprentice">Apprentice</SelectItem>
                <SelectItem value="helper">Helper</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Hourly Rate</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.hourly_rate || ''}
              onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="$"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Certifications</Label>
          <div className="flex gap-2">
            <Input
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              placeholder="e.g., EPA 608"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCert(); } }}
            />
            <Button type="button" variant="outline" onClick={addCert}>Add</Button>
          </div>
          {formData.certifications && formData.certifications.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.certifications.map(cert => (
                <Badge key={cert} variant="secondary" className="gap-1">
                  {cert}
                  <button type="button" onClick={() => removeCert(cert)} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Optional notes"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Member'}
        </Button>
      </form>
    </DialogContent>
  );
}

function AssignMemberForm({ 
  teamId, 
  availableMembers, 
  onAssign, 
  isLoading 
}: { 
  teamId: string;
  availableMembers: TeamMember[];
  onAssign: (memberId: string, isLead: boolean) => void;
  isLoading: boolean;
}) {
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [isLead, setIsLead] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMember) {
      onAssign(selectedMember, isLead);
    }
  };

  if (availableMembers.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        All members are already assigned to this team
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Select Member</Label>
        <Select value={selectedMember} onValueChange={setSelectedMember}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a team member" />
          </SelectTrigger>
          <SelectContent>
            {availableMembers.map(member => (
              <SelectItem key={member.id} value={member.id}>
                {member.first_name} {member.last_name} - {member.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isLead"
          checked={isLead}
          onChange={(e) => setIsLead(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="isLead">Assign as Team Lead</Label>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading || !selectedMember}>
        {isLoading ? 'Assigning...' : 'Assign to Team'}
      </Button>
    </form>
  );
}
