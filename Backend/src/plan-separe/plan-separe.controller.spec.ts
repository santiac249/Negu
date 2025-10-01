import { Test, TestingModule } from '@nestjs/testing';
import { PlanSepareController } from './plan-separe.controller';

describe('PlanSepareController', () => {
  let controller: PlanSepareController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanSepareController],
    }).compile();

    controller = module.get<PlanSepareController>(PlanSepareController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
