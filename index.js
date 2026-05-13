const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Open ticket panel")
].map(c => c.toJSON());

client.once("ready", async () => {
  console.log(`${client.user.tag} is online`);

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  await rest.put(
    Routes.applicationCommands(client.user.id),
    { body: commands }
  );

  console.log("Slash command ready");
});

client.on(Events.InteractionCreate, async (interaction) => {

  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "ticket") {

      const embed = new EmbedBuilder()
        .setTitle("🎫 Ticket System")
        .setDescription("Click below to create a ticket")
        .setColor("Blue");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("create_ticket")
          .setLabel("Create Ticket")
          .setStyle(ButtonStyle.Primary)
      );

      return interaction.reply({ embeds: [embed], components: [row] });
    }
  }

  if (interaction.isButton()) {

    if (interaction.customId === "create_ticket") {

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          }
        ]
      });

      const closeBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("Close Ticket")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `${interaction.user} ticket opened`,
        components: [closeBtn]
      });

      return interaction.reply({
        content: `Ticket created: ${channel}`,
        ephemeral: true
      });
    }

    if (interaction.customId === "close_ticket") {
      await interaction.reply("Closing ticket...");
      setTimeout(() => interaction.channel.delete(), 3000);
    }
  }
});

client.login(process.env.TOKEN);
