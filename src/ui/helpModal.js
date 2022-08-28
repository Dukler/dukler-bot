const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const customIds = ['prev','next']

const helpModalHandler = async (interaction) => {
    if (!customIds.includes(interaction.customId)) return;
    const [game, rest] = interaction.message.embeds[0].title.split(" ");
    const [currentIndex, length] = rest.split("/");
    const prevNext = interaction.customId === 'next' ? 1 : -1
    const index = Number(currentIndex) + prevNext;
    const description = require(`../games/${game}/config.json`).help[index - 1]
    const embed = HelpEmbed({game,description,index,length})
    const buttons = dynamicRow(index, Number(length))
    await interaction.update({embeds:[embed],ephemeral:true, components:[buttons]})
}

const HelpEmbed = ({game, description, index, length}) => {

    return new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`${game} ${index}/${length}`)
        .setDescription(description)
}

const dynamicRow = (index, length) =>{
    const prevDisabled = index === 1 ? true : false;
    const nextDisabled = index === length? true : false;
    return new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(prevDisabled)
    ).addComponents(
        new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(nextDisabled)
    )
}


const HelpButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        ).addComponents(
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary),
        )

module.exports = {
    helpModalHandler,
    HelpEmbed,
    HelpButtons
}