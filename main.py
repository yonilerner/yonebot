import interactions

bot = interactions.Client(token=open(".token", "r").read().split("\n")[0], intents=interactions.Intents.ALL)

@bot.event
async def on_ready():
  print("yone")
  
@bot.command(
  name="yone",
  description="yone",
  options=[
    interactions.Option(
      type=interactions.OptionType.BOOLEAN,
      name="is_yone",
      description="yone?",
      required=True
    )
  ]
)
async def yone(ctx, is_yone):
  await ctx.send("yone!" if is_yone else "yone?")
  
bot.start()
