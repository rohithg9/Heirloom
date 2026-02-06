import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  ArrowLeft, Download, Loader2, BookOpen, FileText,
  Coffee, Heart, Plane, GraduationCap, Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Toaster, toast } from 'sonner';

const ExportPage = () => {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const { api } = useAuth();
  const pdfRef = useRef(null);
  
  const [lifeBook, setLifeBook] = useState(null);
  const [themeBooks, setThemeBooks] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('life-book');

  const themes = [
    { id: 'food', label: 'Stories of Food', icon: <Coffee className="w-5 h-5" /> },
    { id: 'love', label: 'Stories of Love', icon: <Heart className="w-5 h-5" /> },
    { id: 'travel', label: 'Stories of Travel', icon: <Plane className="w-5 h-5" /> },
    { id: 'lessons', label: 'Lessons from Life', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'family', label: 'Family Stories', icon: <Users className="w-5 h-5" /> },
  ];

  useEffect(() => {
    loadExportData();
  }, [memberId]);

  const loadExportData = async () => {
    try {
      const lifeBookRes = await api.get(`/export/life-book/${memberId}`);
      setLifeBook(lifeBookRes.data);
      
      // Load theme books in parallel
      const themePromises = themes.map(async (theme) => {
        try {
          const res = await api.get(`/export/theme-book?theme=${theme.id}`);
          return { id: theme.id, data: res.data };
        } catch (e) {
          return { id: theme.id, data: null };
        }
      });
      
      const themeResults = await Promise.all(themePromises);
      const themeBooksData = {};
      themeResults.forEach(result => {
        themeBooksData[result.id] = result.data;
      });
      setThemeBooks(themeBooksData);
    } catch (error) {
      toast.error('Failed to load export data');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (type = 'life-book', themeId = null) => {
    setGenerating(true);
    
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper functions
      const addPage = () => {
        pdf.addPage();
        yPosition = margin;
      };

      const checkPageBreak = (height) => {
        if (yPosition + height > pageHeight - margin) {
          addPage();
          return true;
        }
        return false;
      };

      // Title Page
      pdf.setFillColor(249, 247, 242); // Ivory background
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setFont('times', 'italic');
      pdf.setFontSize(12);
      pdf.setTextColor(93, 85, 80);
      pdf.text('Heirloom', pageWidth / 2, 30, { align: 'center' });
      
      pdf.setFont('times', 'bold');
      pdf.setFontSize(32);
      pdf.setTextColor(44, 36, 32);
      
      if (type === 'life-book' && lifeBook) {
        pdf.text(`${lifeBook.member.name}'s`, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
        pdf.text('Life Story', pageWidth / 2, pageHeight / 2 + 5, { align: 'center' });
      } else if (type === 'theme' && themeId && themeBooks[themeId]) {
        pdf.text(themeBooks[themeId].title, pageWidth / 2, pageHeight / 2, { align: 'center' });
      }
      
      pdf.setFont('times', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(140, 133, 128);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 30, { align: 'center' });
      
      // Content pages
      addPage();
      
      if (type === 'life-book' && lifeBook) {
        const stages = ['childhood', 'youth', 'adulthood', 'later_life'];
        const stageLabels = {
          childhood: 'Childhood',
          youth: 'Youth',
          adulthood: 'Adulthood',
          later_life: 'Later Life'
        };

        for (const stage of stages) {
          const memories = lifeBook.chapters[stage] || [];
          if (memories.length === 0) continue;

          // Chapter title
          checkPageBreak(30);
          pdf.setFillColor(46, 92, 85);
          pdf.rect(margin, yPosition, contentWidth, 15, 'F');
          pdf.setFont('times', 'bold');
          pdf.setFontSize(18);
          pdf.setTextColor(255, 255, 255);
          pdf.text(stageLabels[stage], margin + 5, yPosition + 10);
          yPosition += 25;

          for (const memory of memories) {
            checkPageBreak(50);
            
            // Memory title
            pdf.setFont('times', 'bold');
            pdf.setFontSize(14);
            pdf.setTextColor(44, 36, 32);
            pdf.text(memory.title || 'Untitled', margin, yPosition);
            yPosition += 8;
            
            // Memory metadata
            const meta = [];
            if (memory.place) meta.push(memory.place);
            if (memory.emotional_tone) meta.push(memory.emotional_tone);
            
            if (meta.length > 0) {
              pdf.setFont('times', 'italic');
              pdf.setFontSize(10);
              pdf.setTextColor(140, 133, 128);
              pdf.text(meta.join(' • '), margin, yPosition);
              yPosition += 6;
            }
            
            // Memory narrative
            pdf.setFont('times', 'normal');
            pdf.setFontSize(11);
            pdf.setTextColor(93, 85, 80);
            
            const lines = pdf.splitTextToSize(memory.narrative || '', contentWidth);
            for (const line of lines) {
              if (checkPageBreak(6)) {
                // Reset after page break
              }
              pdf.text(line, margin, yPosition);
              yPosition += 5;
            }
            
            // Highlights
            if (memory.highlights && memory.highlights.length > 0) {
              yPosition += 5;
              pdf.setFillColor(240, 235, 224);
              const highlightText = `"${memory.highlights[0]}"`;
              const highlightLines = pdf.splitTextToSize(highlightText, contentWidth - 10);
              const highlightHeight = highlightLines.length * 5 + 10;
              
              checkPageBreak(highlightHeight);
              pdf.rect(margin, yPosition, contentWidth, highlightHeight, 'F');
              
              pdf.setFont('times', 'italic');
              pdf.setFontSize(11);
              pdf.setTextColor(46, 92, 85);
              
              let hy = yPosition + 7;
              for (const hline of highlightLines) {
                pdf.text(hline, margin + 5, hy);
                hy += 5;
              }
              yPosition += highlightHeight + 5;
            }
            
            yPosition += 15;
          }
        }
      } else if (type === 'theme' && themeId && themeBooks[themeId]) {
        const themeData = themeBooks[themeId];
        
        for (const memory of themeData.memories) {
          checkPageBreak(50);
          
          // Memory title
          pdf.setFont('times', 'bold');
          pdf.setFontSize(14);
          pdf.setTextColor(44, 36, 32);
          pdf.text(memory.title || 'Untitled', margin, yPosition);
          yPosition += 8;
          
          // Author
          const author = themeData.authors[memory.author_id];
          if (author) {
            pdf.setFont('times', 'italic');
            pdf.setFontSize(10);
            pdf.setTextColor(140, 133, 128);
            pdf.text(`by ${author.name}`, margin, yPosition);
            yPosition += 6;
          }
          
          // Narrative
          pdf.setFont('times', 'normal');
          pdf.setFontSize(11);
          pdf.setTextColor(93, 85, 80);
          
          const lines = pdf.splitTextToSize(memory.narrative || '', contentWidth);
          for (const line of lines) {
            checkPageBreak(6);
            pdf.text(line, margin, yPosition);
            yPosition += 5;
          }
          
          yPosition += 15;
        }
      }

      // Final page - closing
      addPage();
      yPosition = pageHeight / 2 - 30;
      
      pdf.setFont('times', 'italic');
      pdf.setFontSize(16);
      pdf.setTextColor(46, 92, 85);
      pdf.text('Every ordinary life deserves to be', pageWidth / 2, yPosition, { align: 'center' });
      pdf.text('preserved with dignity, voice, and beauty.', pageWidth / 2, yPosition + 10, { align: 'center' });
      
      pdf.setFont('times', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(140, 133, 128);
      pdf.text('Created with Heirloom', pageWidth / 2, yPosition + 40, { align: 'center' });
      pdf.text('heirloom.family', pageWidth / 2, yPosition + 48, { align: 'center' });

      // Download
      const filename = type === 'life-book' 
        ? `${lifeBook?.member?.name || 'family'}-life-story.pdf`
        : `${themeBooks[themeId]?.title || 'theme'}.pdf`;
      
      pdf.save(filename);
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald" />
      </div>
    );
  }

  const totalMemories = lifeBook 
    ? Object.values(lifeBook.chapters).reduce((sum, arr) => sum + arr.length, 0)
    : 0;

  return (
    <div className="min-h-screen bg-ivory">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="bg-ivory border-b border-ivory-300 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-charcoal-light hover:text-charcoal transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <h1 className="font-serif text-2xl text-charcoal">Export Stories</h1>
          
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-ivory-200 p-1 rounded-full">
            <TabsTrigger 
              value="life-book" 
              className="rounded-full data-[state=active]:bg-ivory data-[state=active]:shadow-soft"
              data-testid="life-book-tab"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Life Book
            </TabsTrigger>
            <TabsTrigger 
              value="theme-books" 
              className="rounded-full data-[state=active]:bg-ivory data-[state=active]:shadow-soft"
              data-testid="theme-books-tab"
            >
              <FileText className="w-4 h-4 mr-2" />
              Theme Books
            </TabsTrigger>
          </TabsList>

          {/* Life Book */}
          <TabsContent value="life-book">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="card-paper p-8 text-center">
                <BookOpen className="w-16 h-16 text-emerald mx-auto mb-4" />
                <h2 className="font-serif text-3xl text-charcoal mb-2">
                  {lifeBook?.member?.name}'s Life Story
                </h2>
                <p className="text-charcoal-muted mb-6">
                  A chronological journey through {totalMemories} memories
                </p>
                
                {/* Preview chapters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {['childhood', 'youth', 'adulthood', 'later_life'].map(stage => {
                    const count = lifeBook?.chapters[stage]?.length || 0;
                    return (
                      <div key={stage} className="text-center">
                        <div className="font-serif text-2xl text-emerald">{count}</div>
                        <div className="text-sm text-charcoal-muted capitalize">
                          {stage.replace('_', ' ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <Button 
                  className="btn-primary"
                  onClick={() => generatePDF('life-book')}
                  disabled={generating || totalMemories === 0}
                  data-testid="download-life-book-btn"
                >
                  {generating ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Download className="w-5 h-5 mr-2" />
                  )}
                  Download Life Book PDF
                </Button>
                
                {totalMemories === 0 && (
                  <p className="text-charcoal-muted text-sm mt-4">
                    No memories to export yet. Start by telling some stories!
                  </p>
                )}
              </div>
            </motion.div>
          </TabsContent>

          {/* Theme Books */}
          <TabsContent value="theme-books">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <p className="text-charcoal-muted text-center mb-6">
                Export memories organized by theme
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {themes.map(theme => {
                  const themeData = themeBooks[theme.id];
                  const count = themeData?.memories?.length || 0;
                  
                  return (
                    <motion.div
                      key={theme.id}
                      className="card-paper p-6 flex items-center justify-between"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald/10 flex items-center justify-center text-emerald">
                          {theme.icon}
                        </div>
                        <div>
                          <h3 className="font-serif text-lg text-charcoal">{theme.label}</h3>
                          <p className="text-sm text-charcoal-muted">{count} memories</p>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generatePDF('theme', theme.id)}
                        disabled={generating || count === 0}
                        data-testid={`download-${theme.id}-btn`}
                      >
                        {generating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ExportPage;
