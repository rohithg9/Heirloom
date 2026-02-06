import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { 
  ArrowLeft, Plus, Heart, User, BookOpen, 
  X, Loader2, Check, Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Toaster, toast } from 'sonner';

const FamilyTree = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, api } = useAuth();
  
  const [members, setMembers] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(searchParams.get('add') === 'true');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membersRes, relationshipsRes] = await Promise.all([
        api.get('/members'),
        api.get('/relationships'),
      ]);
      setMembers(membersRes.data);
      setRelationships(relationshipsRes.data);
    } catch (error) {
      toast.error('Failed to load family data');
    } finally {
      setLoading(false);
    }
  };

  // D3 Tree Rendering
  const renderTree = useCallback(() => {
    if (!svgRef.current || members.length === 0) return;

    const container = containerRef.current;
    const width = container?.clientWidth || 800;
    const height = container?.clientHeight || 600;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create force simulation
    const nodes = members.map(m => ({
      ...m,
      x: width / 2,
      y: height / 2,
    }));

    const links = relationships.map(r => ({
      source: nodes.find(n => n.id === r.from_member_id),
      target: nodes.find(n => n.id === r.to_member_id),
      type: r.relationship_type,
    })).filter(l => l.source && l.target);

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).distance(150).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    // Gradient definition
    const defs = svg.append('defs');
    
    const gradient = defs.append('linearGradient')
      .attr('id', 'linkGradient')
      .attr('gradientUnits', 'userSpaceOnUse');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#2E5C55')
      .attr('stop-opacity', 0.6);
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#D4A373')
      .attr('stop-opacity', 0.6);

    // Draw links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', 'url(#linkGradient)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', d => d.type === 'spouse' ? '5,5' : '0');

    // Draw nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Node circles
    node.append('circle')
      .attr('r', 40)
      .attr('fill', '#FDFBF7')
      .attr('stroke', '#E5E0D6')
      .attr('stroke-width', 3)
      .attr('filter', 'drop-shadow(0 4px 8px rgba(44,36,32,0.1))');

    // Node initials or photos
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#2E5C55')
      .attr('font-family', 'Playfair Display, serif')
      .attr('font-size', '20px')
      .text(d => d.name?.charAt(0) || '?');

    // Node names
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '65px')
      .attr('fill', '#2C2420')
      .attr('font-family', 'Manrope, sans-serif')
      .attr('font-size', '14px')
      .text(d => d.name || 'Unknown');

    // Hover effects
    node.on('click', (event, d) => {
      navigate(`/profile/${d.id}`);
    });

    node.on('mouseenter', function() {
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('stroke', '#2E5C55')
        .attr('stroke-width', 4);
    });

    node.on('mouseleave', function() {
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('stroke', '#E5E0D6')
        .attr('stroke-width', 3);
    });

    // Animation
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

  }, [members, relationships, navigate]);

  useEffect(() => {
    renderTree();
    window.addEventListener('resize', renderTree);
    return () => window.removeEventListener('resize', renderTree);
  }, [renderTree]);

  // Add Member Form
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleAddMember = async () => {
    try {
      // Invite new member to vault
      await api.post('/vaults/join', {
        family_name: user.family_name,
        family_code: '', // Admin bypass
        member_name: newMember.name,
        member_email: newMember.email,
        password: newMember.password || 'temp123',
      });
      
      toast.success('Member added to family!');
      setShowAddDialog(false);
      setNewMember({ name: '', email: '', password: '' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add member');
    }
  };

  // Add Relationship
  const [newRelationship, setNewRelationship] = useState({
    from_member_id: '',
    to_member_id: '',
    relationship_type: '',
  });

  const handleAddRelationship = async () => {
    try {
      await api.post('/relationships', newRelationship);
      toast.success('Relationship added!');
      setShowLinkDialog(false);
      setNewRelationship({ from_member_id: '', to_member_id: '', relationship_type: '' });
      loadData();
    } catch (error) {
      toast.error('Failed to add relationship');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="bg-ivory border-b border-ivory-300 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-charcoal-light hover:text-charcoal transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <h1 className="font-serif text-2xl text-charcoal">Family Tree</h1>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost"
              onClick={() => setShowLinkDialog(true)}
              data-testid="add-relationship-btn"
            >
              <LinkIcon className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Connect</span>
            </Button>
            <Button 
              className="btn-primary"
              onClick={() => setShowAddDialog(true)}
              data-testid="add-member-btn"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Add Member</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Tree Container */}
      <main ref={containerRef} className="flex-1 relative overflow-hidden">
        {members.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-emerald" />
              </div>
              <h2 className="font-serif text-2xl text-charcoal mb-2">Start Your Tree</h2>
              <p className="text-charcoal-muted mb-6">Add family members to build your tree</p>
              <Button 
                className="btn-primary"
                onClick={() => setShowAddDialog(true)}
                data-testid="first-member-btn"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add First Member
              </Button>
            </div>
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-full" data-testid="family-tree-svg" />
        )}

        {/* Legend */}
        <div className="absolute bottom-6 left-6 card-paper p-4">
          <h3 className="font-medium text-charcoal mb-2">Relationships</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-emerald" />
              <span className="text-charcoal-muted">Parent/Child</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-amber border-dashed border-t-2 border-amber" />
              <span className="text-charcoal-muted">Spouse</span>
            </div>
          </div>
        </div>
      </main>

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-ivory max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-charcoal">
              Add Family Member
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-charcoal-light">Name</Label>
              <Input
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                className="input-heirloom"
                placeholder="Full name"
                data-testid="new-member-name"
              />
            </div>
            <div>
              <Label className="text-charcoal-light">Email</Label>
              <Input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                className="input-heirloom"
                placeholder="email@example.com"
                data-testid="new-member-email"
              />
            </div>
            <div>
              <Label className="text-charcoal-light">Temporary Password</Label>
              <Input
                type="password"
                value={newMember.password}
                onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                className="input-heirloom"
                placeholder="They can change this later"
                data-testid="new-member-password"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button className="btn-primary" onClick={handleAddMember} data-testid="confirm-add-member">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Relationship Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="bg-ivory max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-charcoal">
              Connect Family Members
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-charcoal-light">From Member</Label>
              <Select 
                value={newRelationship.from_member_id}
                onValueChange={(v) => setNewRelationship({...newRelationship, from_member_id: v})}
              >
                <SelectTrigger className="input-heirloom" data-testid="from-member-select">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-charcoal-light">Relationship</Label>
              <Select 
                value={newRelationship.relationship_type}
                onValueChange={(v) => setNewRelationship({...newRelationship, relationship_type: v})}
              >
                <SelectTrigger className="input-heirloom" data-testid="relationship-type-select">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">is parent of</SelectItem>
                  <SelectItem value="child">is child of</SelectItem>
                  <SelectItem value="spouse">is spouse of</SelectItem>
                  <SelectItem value="sibling">is sibling of</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-charcoal-light">To Member</Label>
              <Select 
                value={newRelationship.to_member_id}
                onValueChange={(v) => setNewRelationship({...newRelationship, to_member_id: v})}
              >
                <SelectTrigger className="input-heirloom" data-testid="to-member-select">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.filter(m => m.id !== newRelationship.from_member_id).map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowLinkDialog(false)}>Cancel</Button>
            <Button 
              className="btn-primary" 
              onClick={handleAddRelationship}
              disabled={!newRelationship.from_member_id || !newRelationship.to_member_id || !newRelationship.relationship_type}
              data-testid="confirm-add-relationship"
            >
              <Check className="w-4 h-4 mr-2" />
              Add Connection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FamilyTree;
