import { Elysia } from 'elysia';
import { Camera, Device, FamilyMember, SensorData } from '../models';

export const dashboardRoutes = new Elysia({ prefix: '/api/dashboard' })
  .get('/', async () => {
    const [cameras, members, devices, latestSensors] = await Promise.all([
      Camera.find().lean(),
      FamilyMember.find().lean(),
      Device.find().lean(),
      SensorData.aggregate([
        { $sort: { timestamp: -1 } },
        { $group: { _id: { deviceId: '$deviceId', type: '$type' }, latest: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$latest' } },
      ]),
    ]);

    const onlineCameras = cameras.filter((c) => c.status === 'online').length;
    const homeMembers = members.filter((m) => m.isHome).length;
    const tempSensor = latestSensors.find((s) => s.type === 'temperature');
    const humiditySensor = latestSensors.find((s) => s.type === 'humidity');

    return {
      success: true,
      data: {
        sensors: {
          temperature: tempSensor?.value ?? null,
          humidity: humiditySensor?.value ?? null,
        },
        cameras: { total: cameras.length, online: onlineCameras },
        family: { total: members.length, home: homeMembers },
        devices: { total: devices.length, online: devices.filter((d) => d.status === 'online').length },
      },
    };
  });
