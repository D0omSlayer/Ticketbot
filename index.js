require('dotenv').config();
const {
Client,
GatewayIntentBits,
ChannelType,
PermissionsBitField,
ActionRowBuilder,
StringSelectMenuBuilder,
ButtonBuilder,
ButtonStyle,
EmbedBuilder
} = require('discord.js');

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildMembers
]
});

// ====== الإعدادات ======
const CATEGORY_ID = '1492196394709024918';
const SUPPORT_ROLE = '1492196156418031746';
const LOG_CHANNEL = '1502225815642050560';

// ====== تشغيل ======
client.once('ready', () => {
console.log(`Logged in as ${client.user.tag}`);
});

// ====== لوحة التكت ======
client.on('messageCreate', async message => {
if (message.content === '!panel') {

const embed = new EmbedBuilder()
.setTitle('🎫 نظام التكتات')
.setDescription('اختر نوع التكت')
.setColor('Blue');

const menu = new StringSelectMenuBuilder()
.setCustomId('ticket')
.setPlaceholder('اختر نوع التكت')
.addOptions([
{ label: 'نشر', value: 'نشر' },
{ label: 'شكوى', value: 'شكوى' },
{ label: 'استفسار', value: 'استفسار' },
{ label: 'اقتراح', value: 'اقتراح' }
]);

const row = new ActionRowBuilder().addComponents(menu);

await message.channel.send({ embeds: [embed], components: [row] });
}
});

// ====== إنشاء التكت ======
client.on('interactionCreate', async interaction => {

if (!interaction.isStringSelectMenu()) return;

const type = interaction.values[0];

// 🚫 منع تعدد التكتات
const existingTicket = interaction.guild.channels.cache.find(
c => c.name.includes(interaction.user.username)
);

if (existingTicket) {
return interaction.reply({
content: '❌ عندك تكت مفتوح بالفعل!',
ephemeral: true
});
}

const channel = await interaction.guild.channels.create({
name: `${type}-${interaction.user.username}`,
type: ChannelType.GuildText,
parent: CATEGORY_ID,

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
PermissionsBitField.Flags.AttachFiles,
PermissionsBitField.Flags.ReadMessageHistory
]
},
{
id: SUPPORT_ROLE,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages,
PermissionsBitField.Flags.AttachFiles,
PermissionsBitField.Flags.ReadMessageHistory
]
}
]
});

// ====== أزرار ======
const row = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId('claim')
.setLabel('📌 استلام')
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId('close')
.setLabel('❌ إغلاق')
.setStyle(ButtonStyle.Danger)
);

// ====== رسالة التكت ======
await channel.send({
content: `<@${interaction.user.id}>`,
embeds: [
new EmbedBuilder()
.setTitle(`تكت ${type}`)
.setDescription('تم فتح التكت بنجاح')
.setColor('Green')
]
});

await channel.send({ components: [row] });

// ====== لوق فتح ======
const log = interaction.guild.channels.cache.get(LOG_CHANNEL);
if (log) {
log.send({
embeds: [
new EmbedBuilder()
.setTitle('📥 فتح تكت')
.addFields(
{ name: 'المستخدم', value: `<@${interaction.user.id}>` },
{ name: 'النوع', value: type },
{ name: 'الروم', value: `${channel}` }
)
.setColor('Yellow')
]
});
}

});

// ====== Claim + Close ======
client.on('interactionCreate', async interaction => {

if (!interaction.isButton()) return;

// ====== Claim ======
if (interaction.customId === 'claim') {

await interaction.channel.setName(`claimed-${interaction.user.username}`);

const log = interaction.guild.channels.cache.get(LOG_CHANNEL);
if (log) {
log.send({
embeds: [
new EmbedBuilder()
.setTitle('📌 استلام تكت')
.addFields(
{ name: 'الروم', value: interaction.channel.name },
{ name: 'الموظف', value: `<@${interaction.user.id}>` }
)
.setColor('Blue')
]
});
}
}

// ====== Close ======
if (interaction.customId === 'close') {

const log = interaction.guild.channels.cache.get(LOG_CHANNEL);

if (log) {
log.send({
embeds: [
new EmbedBuilder()
.setTitle('📤 إغلاق تكت')
.addFields(
{ name: 'الروم', value: interaction.channel.name },
{ name: 'بواسطة', value: `<@${interaction.user.id}>` }
)
.setColor('Red')
]
});
}

await interaction.channel.delete();
}

});

// ====== تشغيل ======
client.login(process.env.TOKEN);
