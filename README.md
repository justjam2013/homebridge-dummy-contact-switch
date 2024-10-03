# "Dummy Switches and Contact" Plugin

This is a fork of [homebridge-dummy-contact](https://github.com/ecoen66/homebridge-dummy-contact), which appears to have been abandoned. This fork fixes the issue with the original plugin where "pluginAlias" conflicts with Nick Farina's [homebridge dummy](https://github.com/nfarina/homebridge-dummy), which it is a fork of. While it installs fine, it then shares it's config with homebridge-dummy and removing it will cause Homebridge to delete and add back all of the switches, causing all HomeKit scenes and automations using said switches to be deleted. Basically ... bad juju.

Example config.json:

```
    "accessories": [
        {
          "accessory": "DummySwitch",
          "name": "My Switch 1"
        }   
    ]

```

With this plugin, you can create any number of fake switches that will do nothing when turned on (and will automatically turn off right afterward, simulating a stateless switch). This can be very useful for advanced automation with HomeKit scenes.

For instance, the Philips Hue app will automatically create HomeKit scenes for you based on Hue Scenes you create. But what if you want to create a scene that contains both Philips Hue actions and other actions (like turning on the coffee maker with a WeMo outlet)? You are forced to either modify the Hue-created scene (which can be a HUGE list of actions if you have lots of lights) or build your own HomeKit lighting scenes.

Instead, you can link scenes using these dummy switches. Let's say you have a Hue Scene called "Rise and Shine" that you want to activate in the morning. And you have also setup the system HomeKit scene "Good Morning" to turn on your coffee maker and disarm you security system. You can add a single dummy switch to your Good Morning scene, then create a Trigger based on the switching-on of the dummy switch that also activates Rise And Shine.

## Stateful Switches

The default behavior of a dummy switch is to turn itself off one second after being turned on. However you may want to create a dummy switch that remains on and must be manually turned off. You can do this by passing an argument in your config.json:

```
    "accessories": [
        {
          "accessory": "DummySwitch",
          "name": "My Stateful Switch 1",
          "stateful": true
        }   
    ]

```

## Reverse Switches

You may also want to create a dummy switch that turns itself on one second after being turned off. This can be done by passing the 'reverse' argument in your config.json:

```
    "accessories": [
        {
          "accessory": "DummySwitch",
          "name": "My Stateful Switch 1",
          "reverse": true
        }   
    ]

```

## Timed Switches

You may also want to create a timed switch that turns itself off after being on for a given time (for example, five seconds). The switch can be repeatedly turned on prior to the timer expiration, which will reset the timer. This can be done by passing the 'time' argument in your config.json:

```
    "accessories": [
        {
          "accessory": "DummySwitch",
          "name": "My Stateful Switch 1",
          "time": 5000
        }   
    ]

```


## This modified version of this Homebridge plugin creates an optional Contact Sensor to complement the switch.

This is to allow NorthernMan54's plugin [homebridge-alexa](https://github.com/NorthernMan54/homebridge-alexa) the ability to trigger routines from the contact sensor.  Also, by default each DummySwitch is a Lightbulb.  This can be changed by passing the 'switch' argument in your config.json:
```
    "accessories": [
        {
          "accessory": "DummySwitch",
          "name": "My Switch with Contact",
          "switch": true,
          "contact": true,
          "contactName": "My Contact"
        }   
    ]

```

