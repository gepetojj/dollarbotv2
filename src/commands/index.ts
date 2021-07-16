import DollarCommand from "./Dollar.command";
import DollarHCommand from "./DollarH.command";
import DollarPlotCommand from "./DollarPlot.command";
import DollarsCommand from "./Dollars.command";
import HelpCommand from "./Help.command";
import PingCommand from "./Ping.command";
import SayCommand from "./Say.command";
import SetCommand from "./Set.command";
import SyncCommand from "./Sync.command";
import TypeRaceCommand from "./TypeRace.command";

import { IBotCommand } from "./IBotCommand";

const dollarCommand = new DollarCommand();
const dollarHCommand = new DollarHCommand();
const dollarPlotCommand = new DollarPlotCommand();
const dollarsCommand = new DollarsCommand();
const helpCommand = new HelpCommand();
const pingCommand = new PingCommand();
const sayCommand = new SayCommand();
const setCommand = new SetCommand();
const syncCommand = new SyncCommand();
const typeraceCommand = new TypeRaceCommand();

const commands: IBotCommand[] = [
	dollarCommand,
	dollarHCommand,
	dollarPlotCommand,
	dollarsCommand,
	helpCommand,
	pingCommand,
	sayCommand,
	setCommand,
	syncCommand,
	typeraceCommand,
];

export default commands;
