const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');



//route 1:  get all the notes using :GET"/api/auth/fetchallnotes" .

router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server Error")
    }

})
//route 3:  add new notes using :POST"/api/notes/addnotes" .
router.post('/addnotes', fetchuser, [
    body('title', 'enter a valid title').isLength({ min: 3 }),
    body('description', 'descriptionshould be of character').isLength({ min: 5 }),

], async (req, res) => {
    try {


        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save();
        res.json(savedNote)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server Error")
    }
})
//route 3:  update a existing  notes using :PUT"/api/notes/updatenotes" .

router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {


        // create a newnotes object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };
        //find the note to be updated and upadte it
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("not found");
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("not allowed");
        }
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("internal server Error")
    }
})

//route 4:  delte a existing  notes using :DELETE"/api/notes/deletenote" .

router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
     //find the note to be updated and upadte it
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("not found");
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("not allowed");
        }
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "note has been deleted", note: note });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("internal server Error")
    }
})

module.exports = router