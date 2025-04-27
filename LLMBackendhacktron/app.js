// app.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { parse } = require('dotenv');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Prompt Builder Function
const promptBuilder = (data) => {
    try {
        const {
            NLPprompt,
            num_questions,
            Difficulty,
            question_types,
            progressive_bloom,
        } = data;

        // Construct the prompt
        let prompt = `${NLPprompt} `;
        prompt += `Generate ${num_questions} ${Difficulty.toLowerCase()} difficulty questions. `;
        
        if (question_types && question_types.length > 0) {
            // Make sure the question types are adhered to strictly
            prompt += `Only include the following question types: ${question_types.join(", ")}. `; 
            prompt += `Do not generate questions of any other types. Ensure that each question corresponds to one of the specified types only. `;
        }

        if (progressive_bloom) {
            prompt += `Arrange the questions progressively according to Bloom’s Taxonomy (Remember ➔ Understand ➔ Apply ➔ Analyze ➔ Evaluate ➔ Create). `;
        }

        prompt += `\nFormat the output strictly as a JSON array of objects. Each object must have the following fields: 
        - "type" (choose one from the specified types: ${question_types.join(", ")}),
        - "question", 
        - "options" (for MCQ, array of 4 options; for True/False, array ["True", "False"]; empty array for Short Answer), 
        - "correct_answer", 
        - "bloom_level" (one of: Remember, Understand, Apply, Analyze, Evaluate, Create), 
        - "explanation". 
        Respond ONLY with valid JSON array without markdown, extra text, or questions of any other type than the specified ones.`;

        // Return the built prompt
        return prompt;

    } catch (error) {
        console.error('Error Building Prompt:', error.message);
        throw new Error('Failed to Build Prompt');
    }
};



app.get("",async(req,res)=>{
    res.status(200).json({"msg" : "Server Running Ok"})
});



// POST endpoint to generate quiz
app.post('/generate-quiz', async (req, res) => {
    const prompt  = promptBuilder(req.body) || req.body.NLPprompt; 
    // console.log('prompt Buid : ', prompt);

    try {
        const ollamaResponse = await axios.post('http://127.0.0.1:11434/api/generate', {
            model: 'mistral:latest',   
            prompt: prompt,
            stream: false    
        });

       
        let rawResponse = ollamaResponse.data.response || "No response";
        const parsedResponse = JSON.parse(rawResponse);
        console.log(parsedResponse);
        res.json(parsedResponse);


    } catch (error) {
        console.error('Error contacting Ollama:', error.message);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
