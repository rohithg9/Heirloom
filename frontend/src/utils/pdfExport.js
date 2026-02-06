import { jsPDF } from 'jspdf';
import { DEMO_FAMILY, DEMO_MEMBERS, DEMO_MEMORIES, DEMO_STATS } from '../data/demoFamily';

// Helper to load image as base64
const loadImageAsBase64 = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('Failed to load image:', e);
    return null;
  }
};

// Color palette
const COLORS = {
  charcoal: [45, 55, 72],
  emerald: [16, 185, 129],
  amber: [217, 119, 6],
  ivory: [255, 251, 235],
  gold: [180, 140, 50],
};

export const generateDemoLifeBook = async (onProgress) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let currentY = margin;

  // Helper functions
  const addNewPage = () => {
    pdf.addPage();
    currentY = margin;
  };

  const setColor = (color) => {
    pdf.setTextColor(...color);
  };

  const setFillColor = (color) => {
    pdf.setFillColor(...color);
  };

  const drawLine = (y, width = contentWidth) => {
    setFillColor(COLORS.gold);
    pdf.rect(margin, y, width, 0.5, 'F');
  };

  // ========== COVER PAGE ==========
  onProgress?.('Creating cover page...');
  
  // Background
  setFillColor([43, 32, 26]); // Rich brown
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Gold border
  pdf.setDrawColor(...COLORS.gold);
  pdf.setLineWidth(1);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');
  pdf.rect(15, 15, pageWidth - 30, pageHeight - 30, 'S');
  
  // Title
  pdf.setFont('times', 'bold');
  setColor(COLORS.ivory);
  pdf.setFontSize(36);
  pdf.text('THE', pageWidth / 2, 80, { align: 'center' });
  
  pdf.setFontSize(48);
  pdf.text(DEMO_FAMILY.name.toUpperCase(), pageWidth / 2, 100, { align: 'center' });
  
  pdf.setFontSize(28);
  pdf.text('FAMILY STORIES', pageWidth / 2, 120, { align: 'center' });
  
  // Decorative line
  setFillColor(COLORS.gold);
  pdf.rect(pageWidth / 2 - 30, 135, 60, 0.5, 'F');
  
  // Tagline
  pdf.setFont('times', 'italic');
  pdf.setFontSize(14);
  setColor([200, 180, 140]);
  pdf.text(DEMO_FAMILY.tagline, pageWidth / 2, 150, { align: 'center' });
  
  // Stats
  pdf.setFont('times', 'normal');
  pdf.setFontSize(12);
  pdf.text(`${DEMO_STATS.generations} Generations`, pageWidth / 2, 180, { align: 'center' });
  pdf.text(`${DEMO_STATS.memories_count} Memories Preserved`, pageWidth / 2, 188, { align: 'center' });
  pdf.text(DEMO_STATS.years_of_memories, pageWidth / 2, 196, { align: 'center' });
  
  // Year range
  pdf.setFontSize(16);
  pdf.text(DEMO_FAMILY.location, pageWidth / 2, 220, { align: 'center' });
  
  // Footer
  pdf.setFontSize(10);
  setColor([150, 130, 100]);
  pdf.text('Created with Heirloom', pageWidth / 2, pageHeight - 25, { align: 'center' });
  pdf.text('Family Memory Preservation', pageWidth / 2, pageHeight - 20, { align: 'center' });

  // ========== TABLE OF CONTENTS ==========
  onProgress?.('Creating table of contents...');
  addNewPage();
  
  setFillColor(COLORS.ivory);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  pdf.setFont('times', 'bold');
  setColor(COLORS.charcoal);
  pdf.setFontSize(24);
  pdf.text('Table of Contents', pageWidth / 2, 40, { align: 'center' });
  
  drawLine(50);
  
  pdf.setFont('times', 'normal');
  pdf.setFontSize(12);
  currentY = 70;
  
  const chapters = [
    { title: 'Our Family Tree', page: 3 },
    { title: 'Childhood Memories', page: 4 },
    { title: 'Youth & Coming of Age', page: 6 },
    { title: 'Adulthood & Family Life', page: 8 },
    { title: 'Later Life & Wisdom', page: 10 },
  ];
  
  chapters.forEach((chapter) => {
    pdf.text(chapter.title, margin, currentY);
    pdf.text(chapter.page.toString(), pageWidth - margin, currentY, { align: 'right' });
    currentY += 12;
  });

  // ========== FAMILY TREE PAGE ==========
  onProgress?.('Creating family tree...');
  addNewPage();
  
  setFillColor(COLORS.ivory);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  pdf.setFont('times', 'bold');
  setColor(COLORS.charcoal);
  pdf.setFontSize(24);
  pdf.text('Our Family Tree', pageWidth / 2, 40, { align: 'center' });
  
  drawLine(50);
  
  // Simple family tree visualization
  currentY = 70;
  pdf.setFontSize(11);
  
  // Generation labels and members
  const generations = [
    { label: 'First Generation', members: DEMO_MEMBERS.filter(m => m.generation === 1) },
    { label: 'Second Generation', members: DEMO_MEMBERS.filter(m => m.generation === 2) },
    { label: 'Third Generation', members: DEMO_MEMBERS.filter(m => m.generation === 3) },
  ];
  
  generations.forEach((gen) => {
    pdf.setFont('times', 'bold');
    setColor(COLORS.emerald);
    pdf.text(gen.label, margin, currentY);
    currentY += 8;
    
    pdf.setFont('times', 'normal');
    setColor(COLORS.charcoal);
    gen.members.forEach((member) => {
      pdf.text(`• ${member.name}`, margin + 5, currentY);
      pdf.setFontSize(9);
      setColor([100, 100, 100]);
      pdf.text(`${member.role} | Born ${member.birth_year} in ${member.birth_place}`, margin + 10, currentY + 5);
      pdf.setFontSize(11);
      setColor(COLORS.charcoal);
      currentY += 15;
    });
    currentY += 10;
  });

  // ========== MEMORY PAGES BY LIFE STAGE ==========
  const lifeStages = ['childhood', 'youth', 'adulthood', 'later_life'];
  const stageNames = {
    childhood: 'Childhood Memories',
    youth: 'Youth & Coming of Age',
    adulthood: 'Adulthood & Family Life',
    later_life: 'Later Life & Wisdom'
  };

  for (const stage of lifeStages) {
    const stageMemories = DEMO_MEMORIES.filter(m => m.life_stage === stage);
    if (stageMemories.length === 0) continue;
    
    onProgress?.(`Adding ${stageNames[stage]}...`);
    addNewPage();
    
    // Chapter header
    setFillColor(COLORS.ivory);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    setFillColor(COLORS.emerald);
    pdf.rect(0, 0, pageWidth, 60, 'F');
    
    pdf.setFont('times', 'bold');
    setColor(COLORS.ivory);
    pdf.setFontSize(28);
    pdf.text(stageNames[stage], pageWidth / 2, 38, { align: 'center' });
    
    currentY = 80;
    
    // Memories
    for (const memory of stageMemories) {
      // Check if we need a new page
      if (currentY > pageHeight - 80) {
        addNewPage();
        setFillColor(COLORS.ivory);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        currentY = margin;
      }
      
      // Memory card
      const cardHeight = 70;
      
      // Author info
      pdf.setFont('times', 'italic');
      setColor([100, 100, 100]);
      pdf.setFontSize(10);
      pdf.text(`${memory.author_name} • ${memory.time_period}`, margin, currentY);
      currentY += 8;
      
      // Title
      pdf.setFont('times', 'bold');
      setColor(COLORS.charcoal);
      pdf.setFontSize(16);
      pdf.text(memory.title, margin, currentY);
      currentY += 8;
      
      // Narrative
      pdf.setFont('times', 'normal');
      pdf.setFontSize(11);
      const lines = pdf.splitTextToSize(`"${memory.narrative}"`, contentWidth);
      pdf.text(lines, margin, currentY);
      currentY += lines.length * 5 + 5;
      
      // Emotion badge
      pdf.setFont('times', 'italic');
      pdf.setFontSize(9);
      setColor(COLORS.amber);
      pdf.text(`Emotion: ${memory.emotional_tone} | Place: ${memory.place || 'Not specified'}`, margin, currentY);
      currentY += 5;
      
      // Highlights
      if (memory.highlights && memory.highlights.length > 0) {
        setColor(COLORS.emerald);
        pdf.text(`Key moment: "${memory.highlights[0]}"`, margin, currentY);
        currentY += 5;
      }
      
      // Divider
      drawLine(currentY);
      currentY += 15;
    }
  }

  // ========== CLOSING PAGE ==========
  onProgress?.('Finishing book...');
  addNewPage();
  
  setFillColor([43, 32, 26]);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  pdf.setFont('times', 'bold');
  setColor(COLORS.ivory);
  pdf.setFontSize(20);
  pdf.text('Every life has a story worth preserving.', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
  
  pdf.setFont('times', 'italic');
  pdf.setFontSize(14);
  setColor([200, 180, 140]);
  pdf.text('This book was created with Heirloom', pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });
  pdf.text('heirloom.family', pageWidth / 2, pageHeight / 2 + 20, { align: 'center' });
  
  // QR code placeholder text
  pdf.setFontSize(10);
  pdf.text('Scan QR codes in the full version to hear original voice recordings', pageWidth / 2, pageHeight - 40, { align: 'center' });

  onProgress?.('Complete!');
  
  return pdf;
};

export const downloadDemoLifeBook = async (onProgress) => {
  try {
    const pdf = await generateDemoLifeBook(onProgress);
    pdf.save(`${DEMO_FAMILY.name}_Family_Stories.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};
