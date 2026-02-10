import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Copy, Trash2, Loader2, CheckCircle, 
  Link2, Clock, X, Share2, Send
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const InviteManager = ({ isOpen, onClose }) => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newInvite, setNewInvite] = useState({ name: '', email: '' });
  const [createdInvite, setCreatedInvite] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchInvites();
    }
  }, [isOpen]);

  const fetchInvites = async () => {
    try {
      const token = localStorage.getItem('heirloom_token');
      const response = await fetch(`${API_URL}/api/invites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInvites(data);
      }
    } catch (err) {
      console.error('Failed to fetch invites:', err);
    } finally {
      setLoading(false);
    }
  };

  const createInvite = async () => {
    setCreating(true);
    try {
      const token = localStorage.getItem('heirloom_token');
      const response = await fetch(`${API_URL}/api/invites/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          invited_name: newInvite.name || null,
          invited_email: newInvite.email || null
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCreatedInvite(data);
        setNewInvite({ name: '', email: '' });
        fetchInvites();
        toast.success('Invite created!');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to create invite');
      }
    } catch (err) {
      toast.error('Failed to create invite');
    } finally {
      setCreating(false);
    }
  };

  const deleteInvite = async (inviteId) => {
    try {
      const token = localStorage.getItem('heirloom_token');
      const response = await fetch(`${API_URL}/api/invites/${inviteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setInvites(invites.filter(i => i.id !== inviteId));
        toast.success('Invite revoked');
      }
    } catch (err) {
      toast.error('Failed to revoke invite');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getFullShareLink = (shareLink) => {
    return `${window.location.origin}${shareLink}`;
  };

  const shareViaWhatsApp = (invite) => {
    const link = getFullShareLink(invite.share_link);
    const message = `You're invited to join our family on Heirloom! 🏠\n\nClick here to join: ${link}\n\nYou'll need this code: ${invite.invite_code}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-charcoal-light rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-ivory/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sage/20 rounded-full flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-sage" />
              </div>
              <div>
                <h2 className="text-lg font-serif text-ivory">Invite Family Members</h2>
                <p className="text-sm text-ivory/60">Share your family vault</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-ivory/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-ivory/60" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Create New Invite */}
            {!createdInvite ? (
              <div className="mb-6 p-4 bg-charcoal rounded-xl border border-ivory/10">
                <h3 className="text-sm font-medium text-ivory mb-3">Create New Invite</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Their name (optional)"
                    value={newInvite.name}
                    onChange={(e) => setNewInvite(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-charcoal-light border border-ivory/20 rounded-lg text-ivory placeholder:text-ivory/40 text-sm"
                    data-testid="invite-name-input"
                  />
                  <input
                    type="email"
                    placeholder="Their email (optional)"
                    value={newInvite.email}
                    onChange={(e) => setNewInvite(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-charcoal-light border border-ivory/20 rounded-lg text-ivory placeholder:text-ivory/40 text-sm"
                    data-testid="invite-email-input"
                  />
                  <button
                    onClick={createInvite}
                    disabled={creating}
                    className="w-full py-2 bg-sage text-charcoal font-medium rounded-lg hover:bg-sage-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    data-testid="create-invite-btn"
                  >
                    {creating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Create Invite Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Show Created Invite */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-sage/10 border border-sage/30 rounded-xl"
              >
                <div className="flex items-center gap-2 text-sage mb-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Invite Created!</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-ivory/60 mb-1">Share Link</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={getFullShareLink(createdInvite.share_link)}
                        className="flex-1 px-3 py-2 bg-charcoal border border-ivory/20 rounded-lg text-ivory text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(getFullShareLink(createdInvite.share_link))}
                        className="p-2 bg-charcoal hover:bg-charcoal-light border border-ivory/20 rounded-lg transition-colors"
                        data-testid="copy-link-btn"
                      >
                        <Copy className="w-4 h-4 text-ivory" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-ivory/60 mb-1">Invite Code (share separately)</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 bg-charcoal border border-ivory/20 rounded-lg text-center">
                        <span className="text-2xl font-mono tracking-widest text-amber-400">{createdInvite.invite_code}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(createdInvite.invite_code)}
                        className="p-2 bg-charcoal hover:bg-charcoal-light border border-ivory/20 rounded-lg transition-colors"
                        data-testid="copy-code-btn"
                      >
                        <Copy className="w-4 h-4 text-ivory" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => shareViaWhatsApp(createdInvite)}
                      className="flex-1 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      data-testid="share-whatsapp-btn"
                    >
                      <Share2 className="w-4 h-4" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => setCreatedInvite(null)}
                      className="flex-1 py-2 bg-charcoal text-ivory border border-ivory/20 font-medium rounded-lg hover:bg-charcoal-light transition-colors"
                    >
                      Create Another
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Pending Invites */}
            <div>
              <h3 className="text-sm font-medium text-ivory mb-3">Pending Invites</h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-sage animate-spin" />
                </div>
              ) : invites.filter(i => i.status === 'pending').length === 0 ? (
                <p className="text-center text-ivory/40 py-4">No pending invites</p>
              ) : (
                <div className="space-y-2">
                  {invites.filter(i => i.status === 'pending').map(invite => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-3 bg-charcoal rounded-lg border border-ivory/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm text-ivory">
                            {invite.invited_name || invite.invited_email || 'Anonymous invite'}
                          </p>
                          <p className="text-xs text-ivory/50">
                            Code: {invite.invite_code}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(getFullShareLink(`/join/${invite.invite_token}`))}
                          className="p-1.5 hover:bg-ivory/10 rounded-lg transition-colors"
                          title="Copy link"
                        >
                          <Link2 className="w-4 h-4 text-ivory/60" />
                        </button>
                        <button
                          onClick={() => deleteInvite(invite.id)}
                          className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Revoke invite"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InviteManager;
