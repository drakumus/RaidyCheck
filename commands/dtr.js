const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder} = require('discord.js');
const { hyperlink, hideLinkEmbed, channelMention, roleMention, userMention } = require('discord.js');
const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

const roles = {
    cancel: "🚫 Can't Make it",
    heal_alac: '💚 Heal Alac',
    heal_quick: '💙 Heal Quickness',
    quickness: '💨 Quickness DPS',
    alacrity: '⏱️ Alacrity DPS',
    dps: '💪 D P S',
    flex: '🐐 Flex'
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dtr')
		.setDescription('Creates an event for you'),
	async execute(interaction) {
        const modal = new ModalBuilder()
        .setCustomId('dtr')
        .setTitle('Wah');

        const eventNameInput = new TextInputBuilder()
            .setCustomId("eventNameInput")
            .setLabel("Event Name")
            .setStyle(TextInputStyle.Short);
        
        const eventDurationInput = new TextInputBuilder()
            .setCustomId("eventDurationInput")
            .setLabel("Event Duration")
            .setPlaceholder("i.e. 2 hours")
            .setStyle(TextInputStyle.Short);

        const eventTimeInput = new TextInputBuilder()
            .setCustomId("eventTimeInput")
            .setLabel("Event Time")
            .setStyle(TextInputStyle.Short)
            .setValue('Use https://r.3v.fi/discord-timestamps');
            

        const first_row = new ActionRowBuilder().addComponents(eventNameInput);
        const second_row = new ActionRowBuilder().addComponents(eventDurationInput);
        const third_row = new ActionRowBuilder().addComponents(eventTimeInput);

        modal.addComponents(first_row, second_row, third_row);

		await interaction.showModal(modal);
	},
    async modalRespond(interaction) {
        const eventName     = interaction.fields.getTextInputValue('eventNameInput');
        const eventDuration = interaction.fields.getTextInputValue('eventDurationInput');
        const eventTime     = interaction.fields.getTextInputValue('eventTimeInput');
        const embedResponse = new EmbedBuilder()
            .setTitle(`${eventName}`)
            .setColor(0x00FFFF)
            .setDescription("You down to raid? If you can make it select your preferred role below!")
            .addFields(
                { name: "📅 Date", value: eventTime, inline: true},
                { name: "⌛ Duration", value: eventDuration, inline: true },
                { name: "🥵 Raiders", value: "None", inline: false },
                { name: "😞 Can't Make It", value: "None", inline: true }
            );
        let options = [];
        for(let role in roles) {
            options.push(
                {
                    label: roles[role],
                    value: role
                }
            );
        }
        const select_role_menu = new SelectMenuBuilder()
            .setCustomId('dtr')
            .setPlaceholder(`What's your role?`)
            .addOptions(options)

        const roles_row = new ActionRowBuilder().addComponents(select_role_menu);
        await interaction.reply({ embeds: [embedResponse], components: [roles_row] })
    },
    async selectRole(interaction) {
        let original_embed = interaction.message.embeds[0];
        let user_role = roles[interaction.values[0]];
        let user_mention = userMention(interaction.user.id);
        let user_text = `${user_mention}`;
        let is_cancel = user_role == roles.cancel;

        for(field_index in original_embed.fields) {
            let field = original_embed.fields[field_index];
            let names = [];
            let found = false;
            if(field.name == "🥵 Raiders") {
                if(field.value != "None") {
                    names = field.value.split('\n');
                }
                for(let name_index in names) {
                    let name = names[name_index];
                    if(name.includes(user_mention)) {
                        found = true;
                        if(is_cancel) {
                            names.splice(name_index, 1);
                        } else {
                            names.splice(name_index, 1, `${user_role}\t${user_text}`);
                        }
                    }
                }
                if(!found && !is_cancel) {
                    names.push(`${user_role}\t${user_text}`);
                } else if (names.length == 0) {
                    names.push(`None`);
                }
                field.value = names.join('\n');
            } else if(field.name == "😞 Can't Make It") {
                if(field.value != "None") {
                    names = field.value.split('\n');
                }
                for(let name_index in names) {
                    let name = names[name_index];
                    if(name.includes(user_mention)) {
                        found = true;
                        if(!is_cancel) {
                            names.splice(name_index, 1);
                        }
                    }
                }
                if(!found && is_cancel) {
                    names.push(`${user_text}`);
                } else if (names.length == 0) {
                    names.push(`None`);
                }
                field.value = names.join('\n');
            }
        }
        const updated_embed = EmbedBuilder.from(interaction.message.embeds[0]);
        await interaction.update({embeds: [updated_embed]})
    }
};