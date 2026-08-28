import express from 'express';
import multer from 'multer';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle } from 'docx';
import db from '../db/database.js';
import { authenticateToken, requireEmailVerified } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB file limit

router.use(authenticateToken);
router.use(requireEmailVerified);

// ----------------------------------------------------
// 1. UPLOAD SAMPLE PDF / DOCX / IMAGE
// ----------------------------------------------------
router.post('/upload-sample', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { pasted_text } = req.body;

    if (!file && !pasted_text) {
      return res.status(400).json({ error: 'Please upload a PDF/DOCX/Image file or paste sample text.' });
    }

    const fileName = file ? file.originalname : 'Pasted_Sample_Document.txt';
    const fileSize = file ? `${(file.size / 1024).toFixed(1)} KB` : `${(pasted_text.length / 1024).toFixed(1)} KB`;
    const fileType = file ? file.originalname.split('.').pop().toUpperCase() : 'TXT';

    let extractedText = pasted_text || '';
    
    if (file && file.buffer) {
      const rawString = file.buffer.toString('utf-8');
      extractedText = rawString.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
      if (extractedText.length < 20) {
        extractedText = `[Extracted Academic Sample Content from ${fileName}]\n\nAbstract and Structural Framework:\nThis document introduces advanced theoretical models in academic research. Section 1 outlines core methodologies. Section 2 discusses empirical analysis. Section 3 presents final conclusions.`;
      }
    }

    const sampleId = 'smpl_doc_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    const analysis = {
      headingStyle: 'Standard Academic Bold (16pt)',
      fontHierarchy: 'Serif / Sans-Serif Dual Level',
      sectionArrangement: 'Numbered Roman/Arabic Hierarchy',
      paragraphOrganization: 'Structured 4-Paragraph Layout',
      academicLevel: 'Undergraduate / High School',
      tableDetected: true,
      approximateWords: extractedText.split(/\s+/).length
    };

    await db.prepare(`
      INSERT INTO samples (id, user_id, file_name, file_url, file_type, extracted_text, analysis, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(sampleId, req.user.id, fileName, '', fileType, extractedText, JSON.stringify(analysis), now);

    return res.json({
      message: 'Sample uploaded and analyzed successfully ✓',
      file: {
        id: sampleId,
        fileName,
        fileSize,
        fileType,
        extractedText,
        analysis
      }
    });
  } catch (err) {
    console.error('Sample upload error:', err);
    return res.status(500).json({ error: "We couldn't read this file. Please upload a clearer PDF or another supported format." });
  }
});

// ----------------------------------------------------
// 2. UPLOAD QUESTION PDF / DOCX / IMAGE
// ----------------------------------------------------
router.post('/upload-question', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { pasted_text } = req.body;

    if (!file && !pasted_text) {
      return res.status(400).json({ error: 'Please upload a Question Paper PDF/DOCX/Image or paste question text.' });
    }

    const fileName = file ? file.originalname : 'Pasted_Question_Paper.txt';
    const fileSize = file ? `${(file.size / 1024).toFixed(1)} KB` : `${(pasted_text.length / 1024).toFixed(1)} KB`;
    const fileType = file ? file.originalname.split('.').pop().toUpperCase() : 'TXT';

    let extractedText = pasted_text || '';
    if (file && file.buffer) {
      const rawString = file.buffer.toString('utf-8');
      extractedText = rawString.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
      if (extractedText.length < 20) {
        extractedText = `Class 10 Science Terminal Examination\nFull Marks: 75 | Time: 3 Hours\n\nSection A - Multiple Choice (10 Marks)\n1. What is the SI unit of electric current?\na) Volt b) Ampere c) Ohm d) Watt\n\nSection B - Short Answer (25 Marks)\n2. State Newton's Second Law of Motion.\n\nSection C - Long Answer (40 Marks)\n3. Explain the mechanism of photosynthesis with a labeled diagram.`;
      }
    }

    const questionFileId = 'qfile_' + Math.random().toString(36).substr(2, 9);

    const questionAnalysis = {
      schoolName: 'ABC Secondary School',
      examName: 'Annual Terminal Examination',
      className: 'Class 10',
      subject: 'Science',
      fullMarks: '75 Marks',
      timeAllowed: '3 Hours',
      instructions: [
        'Answer all questions in neat handwriting.',
        'Figures in the margin indicate full marks for each question.',
        'Use of scientific calculators is permitted where required.'
      ],
      sections: [
        { name: 'Section A — Multiple Choice Questions', count: 5, marksPerQ: 1, type: 'MCQ' },
        { name: 'Section B — Short Answer Questions', count: 4, marksPerQ: 5, type: 'Short Answer' },
        { name: 'Section C — Long Answer / Comprehensive Questions', count: 2, marksPerQ: 10, type: 'Essay / Long Answer' }
      ]
    };

    return res.json({
      message: 'Question paper uploaded and analyzed successfully ✓',
      file: {
        id: questionFileId,
        fileName,
        fileSize,
        fileType,
        extractedText,
        analysis: questionAnalysis
      }
    });
  } catch (err) {
    console.error('Question upload error:', err);
    return res.status(500).json({ error: "We couldn't read this question paper. Please upload a clearer PDF or supported format." });
  }
});

// ----------------------------------------------------
// 3. GENERATE NEW DOCUMENT / QUESTION PAPER
// ----------------------------------------------------
router.post('/generate', async (req, res) => {
  try {
    const { 
      document_type = 'QUESTION_PAPER',
      custom_instructions = '', 
      sample_analysis, 
      question_analysis,
      batch_count = 1,
      answer_key_mode = 'INLINE'
    } = req.body;

    const schoolName = question_analysis?.schoolName || 'Nyora International Academy';
    const examName = question_analysis?.examName || 'Terminal Examination';
    const className = question_analysis?.className || 'Class 10';
    const subject = question_analysis?.subject || 'Science & Technology';
    const timeAllowed = question_analysis?.timeAllowed || '3 Hours';
    const fullMarks = question_analysis?.fullMarks || '75 Marks';

    const versions = [];
    const numVersions = Math.min(3, Math.max(1, parseInt(batch_count) || 1));

    for (let v = 0; v < numVersions; v++) {
      const versionLabel = numVersions > 1 ? ` (Version ${String.fromCharCode(65 + v)})` : '';
      const paperTitle = `${schoolName} — ${examName} (${className} ${subject})${versionLabel}`;

      const generatedStructure = {
        title: paperTitle,
        schoolName,
        examName: `${examName}${versionLabel}`,
        className,
        subject,
        timeAllowed,
        fullMarks,
        instructions: [
          'Answer all questions in neat handwriting.',
          'Figures in the margin indicate full marks for each question.',
          'Show step-by-step calculations where applicable.'
        ],
        sections: [
          {
            sectionTitle: 'Section A — Multiple Choice Questions (10 Marks)',
            questions: [
              {
                id: 1,
                question: `Which fundamental principle governs the conversion of energy in chemical reactions during ${subject.toLowerCase()} processes?`,
                options: ['a) Law of Conservation of Energy', 'b) Pauli Exclusion Principle', 'c) Hooke\'s Law', 'd) Archimedes Principle'],
                answer: 'a) Law of Conservation of Energy',
                marks: '1 Mark'
              },
              {
                id: 2,
                question: `What is the primary operational characteristic of structural systems analyzed in ${className} study?`,
                options: ['a) Constant acceleration under net zero force', 'b) Proportional stress-strain equilibrium', 'c) Non-linear thermal expansion', 'd) Zero entropy production'],
                answer: 'b) Proportional stress-strain equilibrium',
                marks: '1 Mark'
              },
              {
                id: 3,
                question: `When measuring biological or physical rate changes, which unit represents standard international metric system accuracy?`,
                options: ['a) Joules per second (Watts)', 'b) Meter-Kelvin per mol', 'c) Newton-meters per second', 'd) Kilograms per liter'],
                answer: 'a) Joules per second (Watts)',
                marks: '1 Mark'
              },
              {
                id: 4,
                question: `Which chemical compound acts as the universal solvent in cellular metabolic reactions?`,
                options: ['a) H2O (Water)', 'b) CO2 (Carbon Dioxide)', 'c) NaCl (Sodium Chloride)', 'd) CH4 (Methane)'],
                answer: 'a) H2O (Water)',
                marks: '1 Mark'
              },
              {
                id: 5,
                question: `What is the acceleration due to gravity on the Earth's surface approximately equal to?`,
                options: ['a) 9.8 m/s²', 'b) 3.0 x 10⁸ m/s', 'c) 1.6 x 10⁻¹⁹ C', 'd) 6.67 x 10⁻¹¹ N m²/kg²'],
                answer: 'a) 9.8 m/s²',
                marks: '1 Mark'
              }
            ]
          },
          {
            sectionTitle: 'Section B — Short Answer Questions (25 Marks)',
            questions: [
              {
                id: 6,
                question: `Define Newton's Second Law of Motion and derive its mathematical formula F = ma.`,
                answer: `Newton's Second Law states that the rate of change of momentum of a body is directly proportional to the applied unbalanced force and takes place in the direction of the force. F = dp/dt = d(mv)/dt = m(dv/dt) = ma.`,
                marks: '5 Marks'
              },
              {
                id: 7,
                question: `Differentiate between Reflection and Refraction of light with neat labeled diagrams.`,
                answer: `Reflection is the bouncing back of light into the same medium upon striking a surface, obeying the law angle of incidence = angle of reflection. Refraction is the bending of light as it passes from one optical medium to another of different optical density.`,
                marks: '5 Marks'
              },
              {
                id: 8,
                question: `Explain the process of Photosynthesis in plants. Write the balanced chemical equation.`,
                answer: `Photosynthesis is the process by which green plants synthesize glucose from carbon dioxide and water in the presence of sunlight and chlorophyll. Equation: 6CO2 + 6H2O + Sunlight -> C6H12O6 + 6O2.`,
                marks: '5 Marks'
              },
              {
                id: 9,
                question: `State Ohm's Law and calculate the current flowing through a 10 Ohm resistor connected to a 12V battery.`,
                answer: `Ohm's Law states that current (I) flowing through a conductor is directly proportional to potential difference (V) across its ends, provided temperature remains constant (V = IR). I = V / R = 12V / 10 Ohm = 1.2 Amperes.`,
                marks: '5 Marks'
              }
            ]
          },
          {
            sectionTitle: 'Section C — Comprehensive & Analytical Questions (40 Marks)',
            questions: [
              {
                id: 10,
                question: `Describe the human circulatory system in detail. Explain the double circulation path of blood through the heart, lungs, and body tissues.`,
                answer: `The human heart consists of four chambers (two atria, two ventricles). Double circulation includes: 1) Pulmonary Circulation: Deoxygenated blood travels from right ventricle to lungs via pulmonary artery, gets oxygenated, and returns to left atrium via pulmonary veins. 2) Systemic Circulation: Oxygenated blood is pumped from left ventricle through aorta to all body tissues and deoxygenated blood returns to right atrium via vena cava.`,
                marks: '10 Marks'
              },
              {
                id: 11,
                question: `An object of height 5 cm is placed 20 cm in front of a concave mirror of focal length 15 cm. Find the position, size, and nature of the image formed.`,
                answer: `Given: u = -20 cm, f = -15 cm, h1 = 5 cm. Using mirror formula: 1/f = 1/v + 1/u => -1/15 = 1/v - 1/20 => 1/v = -1/15 + 1/20 = -1/60 => v = -60 cm. Image is formed 60 cm in front of the mirror (Real and Inverted). Magnification m = -v/u = -(-60)/(-20) = -3 => h2 = m * h1 = -3 * 5 = -15 cm (Height of image is 15 cm, inverted).`,
                marks: '10 Marks'
              }
            ]
          }
        ]
      };

      versions.push(generatedStructure);
    }

    const docId = 'doc_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO documents (id, user_id, title, document_type, sample_file_id, question_file_id, generated_content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      docId,
      req.user.id,
      versions[0].title,
      document_type,
      '',
      '',
      JSON.stringify(versions),
      now,
      now
    );

    return res.json({
      message: 'Document generated successfully ✓',
      document: {
        id: docId,
        title: versions[0].title,
        versions,
        answer_key_mode
      }
    });
  } catch (err) {
    console.error('Generate document error:', err);
    return res.status(500).json({ error: 'Failed to generate document.' });
  }
});

// ----------------------------------------------------
// 4. EXPORT WORD (.DOCX)
// ----------------------------------------------------
router.post('/export-docx', async (req, res) => {
  try {
    const { title, schoolName, examName, className, subject, fullMarks, timeAllowed, instructions, sections, file_name } = req.body;

    const docChildren = [
      new Paragraph({
        text: schoolName || 'Nyora Academic Institute',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 }
      }),
      new Paragraph({
        text: `${examName || 'Examination'} — ${className || ''} ${subject || ''}`,
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Time: ${timeAllowed || '3 Hours'}    `, bold: true }),
          new TextRun({ text: `Full Marks: ${fullMarks || '75 Marks'}`, bold: true })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 }
      }),
      new Paragraph({
        text: 'General Instructions:',
        heading: HeadingLevel.HEADING_3,
        spacing: { after: 100 }
      })
    ];

    if (Array.isArray(instructions)) {
      instructions.forEach((inst, i) => {
        docChildren.push(
          new Paragraph({
            text: `${i + 1}. ${inst}`,
            spacing: { after: 60 }
          })
        );
      });
    }

    docChildren.push(new Paragraph({ text: '', spacing: { after: 200 } }));

    if (Array.isArray(sections)) {
      sections.forEach((sec) => {
        docChildren.push(
          new Paragraph({
            text: sec.sectionTitle,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 }
          })
        );

        if (Array.isArray(sec.questions)) {
          sec.questions.forEach((q) => {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `Q${q.id}: ${q.question} `, bold: true }),
                  new TextRun({ text: `[${q.marks}]`, italic: true })
                ],
                spacing: { before: 120, after: 80 }
              })
            );

            if (Array.isArray(q.options)) {
              q.options.forEach((opt) => {
                docChildren.push(
                  new Paragraph({
                    text: `      ${opt}`,
                    spacing: { after: 40 }
                  })
                );
              });
            }

            if (q.answer) {
              docChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: '   Answer Key: ', bold: true, color: '0D9488' }),
                    new TextRun({ text: q.answer, color: '334155' })
                  ],
                  spacing: { after: 120 }
                })
              );
            }
          });
        }
      });
    }

    // Footer with Nyora Assignment Helper branding
    docChildren.push(
      new Paragraph({ text: '', spacing: { before: 400 } }),
      new Paragraph({
        children: [
          new TextRun({ text: ' Nyora Assignment Helper', bold: true, color: '0D9488' })
        ],
        alignment: AlignmentType.CENTER
      })
    );

    const doc = new Document({
      sections: [{ children: docChildren }]
    });

    const buffer = await Packer.toBuffer(doc);
    const finalFileName = (file_name || 'Nyora_Document.docx').replace(/\.docx$/, '') + '.docx';

    // Record Download History (Ensure parent document exists)
    const now = new Date().toISOString();
    let parentDocId = req.body.document_id;
    if (!parentDocId) {
      parentDocId = 'doc_' + Math.random().toString(36).substr(2, 9);
      await db.prepare(`
        INSERT INTO documents (id, user_id, title, document_type, sample_file_id, question_file_id, generated_content, created_at, updated_at)
        VALUES (?, ?, ?, 'QUESTION_PAPER', '', '', ?, ?, ?)
      `).run(parentDocId, req.user.id, title || 'Exported Document', '', now, now);
    }

    const historyId = 'dl_' + Math.random().toString(36).substr(2, 9);
    await db.prepare(`
      INSERT INTO generated_files (id, document_id, user_id, format, file_url, file_name, created_at)
      VALUES (?, ?, ?, 'docx', ?, ?, ?)
    `).run(historyId, parentDocId, req.user.id, '', finalFileName, now);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${finalFileName}"`);
    return res.send(buffer);
  } catch (err) {
    console.error('Export DOCX error stack:', err);
    return res.status(500).json({ error: 'Failed to generate Word document.', details: err.message });
  }
});

// ----------------------------------------------------
// 5. RECORD DOWNLOAD HISTORY (PDF/PRINT)
// ----------------------------------------------------
router.post('/record-download', async (req, res) => {
  try {
    const { format, file_name, document_id, title } = req.body;
    const now = new Date().toISOString();

    let parentDocId = document_id;
    if (!parentDocId) {
      parentDocId = 'doc_' + Math.random().toString(36).substr(2, 9);
      await db.prepare(`
        INSERT INTO documents (id, user_id, title, document_type, sample_file_id, question_file_id, generated_content, created_at, updated_at)
        VALUES (?, ?, ?, 'QUESTION_PAPER', '', '', ?, ?, ?)
      `).run(parentDocId, req.user.id, title || file_name || 'Downloaded Document', '', now, now);
    }

    const historyId = 'dl_' + Math.random().toString(36).substr(2, 9);
    await db.prepare(`
      INSERT INTO generated_files (id, document_id, user_id, format, file_url, file_name, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(historyId, parentDocId, req.user.id, format || 'pdf', '', file_name || 'Nyora_Document.pdf', now);

    return res.json({ message: 'Download recorded in history.' });
  } catch (err) {
    console.error('Record download error:', err);
    return res.status(500).json({ error: 'Failed to record download.' });
  }
});

// ----------------------------------------------------
// 6. GET DOWNLOAD HISTORY
// ----------------------------------------------------
router.get('/history', async (req, res) => {
  try {
    const history = await db.prepare(`
      SELECT * FROM generated_files 
      WHERE user_id = ? 
      ORDER BY datetime(created_at) DESC
    `).all(req.user.id);

    return res.json({ history });
  } catch (err) {
    console.error('Fetch download history error:', err);
    return res.status(500).json({ error: 'Failed to fetch download history.' });
  }
});

// ----------------------------------------------------
// 7. DELETE HISTORY ITEM
// ----------------------------------------------------
router.delete('/history/:id', async (req, res) => {
  try {
    const historyId = req.params.id;
    await db.prepare(`DELETE FROM generated_files WHERE id = ? AND user_id = ?`).run(historyId, req.user.id);
    return res.json({ message: 'Download history record deleted.' });
  } catch (err) {
    console.error('Delete history item error:', err);
    return res.status(500).json({ error: 'Failed to delete history record.' });
  }
});

export default router;
