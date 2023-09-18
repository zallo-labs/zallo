import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { SIMULATIONS_QUEUE, SimulationRequest } from './simulations.processor';
import { Queue } from 'bull';

@Injectable()
export class SimulationsService {
  constructor(
    @InjectQueue(SIMULATIONS_QUEUE.name)
    private queue: Queue<SimulationRequest>,
  ) {}

  async request(req: SimulationRequest) {
    return this.queue.add(req);
  }
}
