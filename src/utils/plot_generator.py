import sys
import secrets
import datetime
import numpy as np
import matplotlib.pyplot as plot

args = sys.argv
dates = args[1]
values = args[2]

x = []
y = []

dates_list = dates.split(",")
values_list = values.split(",")

for date in dates_list:
    x.append(str(date))

for value in values_list:
    y.append(float(value))


def create_plot(x, y):
    foto, graf = plot.subplots(figsize=(8, 6))
    graf.bar(np.arange(7), y)
    graf.set(xlabel="Data", ylabel="Valor do dólar",
             title="Valores dos últimos 7 dias")
    graf_id = datetime.datetime.now().strftime("%d-%m-%Y-") + secrets.token_hex(5)
    plot.xticks(np.arange(7), x)
    plot.ylim([4.5, 6.5])
    plot.grid(True, axis="y", color="black", ls="-.", lw=0.18)
    foto.savefig(f"temp/{graf_id}.png")
    filename = graf_id + ".png"
    print(filename)
    return filename


create_plot(x, y)
