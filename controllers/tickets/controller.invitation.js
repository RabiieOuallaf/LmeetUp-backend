const Invitation = require('../../models/Tickets/model.invitation');
const ClassModel = require('../../models/Tickets/model.class');
const EventModel = require('../../models/Events/model.event');
const nodemailer = require('nodemailer');


exports.addInvitation = async (req, res) => {
    try {
        const classId = req.body.class;
        const eventId = req.body.event;

        const foundClass = await ClassModel.findById(classId);
        const foundEvent = await EventModel.findById(eventId);

        if(!foundClass || !foundEvent) {
            return res.status(404).json({ error: "Class or event not found" });
        }


        const invitation = {
            ...req.body,
        };
        const savedInvitation = await new Invitation(invitation).save();

        res.status(201).json(savedInvitation);
    } catch (error) {
        console.error("Error adding invitation:", error);
        res.status(400).json({ error });
    } 
}

exports.updateInvitation = async (req, res) => {
    try {
        let invitationId = req.params.id;
        const foundInvitation = await Invitation.findById(invitationId);
        if (!foundInvitation)
            return res.status(404).json({ error: "Invitation not found" });

        const updatedInvitationData = {
            ...req.body,
        };

        Object.assign(foundInvitation, updatedInvitationData);
        const updatedInvitation = await foundInvitation.save();

        res.json({ updatedInvitation });
    } catch (error) {
        console.error("Error updating invitation:", error);
        res.status(400).json({ error });
    }
}

exports.getInvitationByFirstAndLastName = async (req, res) => {
    try {
        const firstName = req.params.firstName;
        const lastName = req.params.lastName;
        const foundInvitation = await Invitation.findOne({ firstName, lastName });
        if (!foundInvitation)
            return res.status(404).json({ error: "Invitation not found" });

        const serializedInvitation = foundInvitation.toJSON();
        res.json(serializedInvitation);
    } catch (error) {
        console.error("Error getting invitation:", error);
        res.status(400).json({ error });
    }
}

exports.getInvitation = async (req, res) => {
    try {
        const invitationId = req.params.id;
        const foundInvitation = await Invitation.findById(invitationId);
        if (!foundInvitation)
            return res.status(404).json({ error: "Invitation not found" });

        const serializedInvitation = foundInvitation.toJSON();
        res.json(serializedInvitation);
    } catch (error) {
        console.error("Error getting invitation:", error);
        res.status(400).json({ error });
    }
}

exports.getAllInvitations = async (req, res) => {
    try {
        const foundInvitations = await Invitation.find();
        if (!foundInvitations)
            return res.status(404).json({ error: "Invitations not found" });

        res.json(foundInvitations);
    } catch (error) {
        console.error("Error getting invitations:", error);
        res.status(400).json({ error });
    }
}

exports.deleteInvitation = async (req, res) => {
    try {
        const invitationId = req.params.id;
        const foundInvitation = await Invitation.findById(invitationId);
        if (!foundInvitation)
            return res.status(404).json({ error: "Invitation not found" });

        await foundInvitation.remove();

        res.json({ message: "Invitation deleted successfully" });
    } catch (error) {
        console.error("Error deleting invitation:", error);
        res.status(400).json({ error });
    }
}
exports.sendInvitationEmail = async (req, res) => {
    try {
      const invitationId = req.params.id;
  
      // Retrieve invitation details from the database based on the ID
      const foundInvitation = await Invitation.findById(invitationId);
      const foundEvent = await EventModel.findById(foundInvitation.event);
      if (!foundInvitation) {
        return res.status(404).json({ error: 'Invitation not found' });
      }
      console.log(foundEvent)
      // Structure the email content based on the invitation details
      const mailOptions = {
        from: '',
        to: req.body.email,
        subject: 'Invitation Email Subject',
        text: `Dear ${foundInvitation.firstName} ${foundInvitation.lastName},\n\n` +
              `You are invited to our event. ${foundEvent.title} for ${foundEvent.description} in ${foundEvent.startTime} at ${foundEvent.date}\n\n` +
              'Best regards,\nYour Organization',
      };
  
      // Create a Nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
          user: '',
          pass: '',
        },
      });
  
      // Send the email
      await transporter.sendMail(mailOptions);
  
      return res.status(200).json({ success: true, message: 'Invitation email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ success: false, message: 'Failed to send invitation email' });
    }
  };